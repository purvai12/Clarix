import {
  rpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Operation,
  Asset,
  Keypair,
  Contract,
  xdr,
  Address,
  Horizon,
} from '@stellar/stellar-sdk';
import {
  StellarWalletsKit,
} from '@creit.tech/stellar-wallets-kit';

// ─── Contract / account addresses ────────────────────────────────────────────
export const CLARIX_REGISTRY_ID = 'CBLTKX433VCXF4TRKGNP4V26UAWJZ6YXC2VVXYGQM2NDIBFIQFTQZGTY';
export const CLARIX_REWARD_ID = 'CDCLUCN5DQWEHQB3FWP7N6D6NT54WBWAXO5EZI6HCVFBZFT3AIAJCEX7';
export const ADMIN_ADDRESS = import.meta.env.VITE_TREASURY_ADDRESS as string;
export const FEATURE_FEE_XLM = 0.5;
export const REPORTER_REWARD_XLM = 10;

// ─── Testnet RPC & Horizon ───────────────────────────────────────────────────
const RPC_URL = 'https://soroban-testnet.stellar.org';
const HORIZON_URL = 'https://horizon-testnet.stellar.org';
export const server = new rpc.Server(RPC_URL);
export const horizonServer = new Horizon.Server(HORIZON_URL);

// ─── Stellar Expert URLs ─────────────────────────────────────────────────────
export const stellarExpertTxUrl = (hash: string) =>
  `https://stellar.expert/explorer/testnet/tx/${hash}`;
export const stellarExpertAccountUrl = (address: string) =>
  `https://stellar.expert/explorer/testnet/account/${address}`;

// ─── Error types ─────────────────────────────────────────────────────────────
export class UserRejectedError extends Error {
  constructor() {
    super('Transaction rejected by user.');
    this.name = 'UserRejectedError';
  }
}

export class InsufficientFundsError extends Error {
  constructor() {
    super('Insufficient XLM to pay the network fee.');
    this.name = 'InsufficientFundsError';
  }
}

export class NetworkError extends Error {
  constructor(detail: string) {
    super(`Network or simulation error: ${detail}`);
    this.name = 'NetworkError';
  }
}

// ─── Legacy Freighter helpers (kept for backward compat) ─────────────────────
export async function checkFreighter(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  return !!(window as any).freighter;
}

export async function getPublicKey(): Promise<string> {
  if (!(await checkFreighter())) {
    throw new Error('Freighter wallet not installed');
  }
  return await (window as any).freighter.getPublicKey();
}

// ─── Sign & submit using StellarWalletsKit ───────────────────────────────────
export async function signAndSubmitSWK(txXdr: string): Promise<string> {
  try {
    const { signedTxXdr } = await StellarWalletsKit.sign({ xdr: txXdr });

    const transaction = TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET);
    const response = await server.sendTransaction(transaction as any);

    if (response.status === 'PENDING') {
      let txResponse = await server.getTransaction(response.hash);
      while (txResponse.status === 'NOT_FOUND') {
        await new Promise((r) => setTimeout(r, 1000));
        txResponse = await server.getTransaction(response.hash);
      }
      if (txResponse.status === 'SUCCESS') return response.hash;
      throw new NetworkError(txResponse.status);
    }
    throw new NetworkError('Transaction failed to enter PENDING state');
  } catch (error: any) {
    const msg = error?.message ?? '';
    if (msg.includes('User declined') || msg.includes('rejected')) throw new UserRejectedError();
    if (msg.includes('insufficient')) throw new InsufficientFundsError();
    throw new NetworkError(msg);
  }
}

// ─── Legacy Freighter sign & submit (kept for backward compat) ───────────────
export async function signAndSubmit(txXdr: string): Promise<string> {
  try {
    const signedXdr = await (window as any).freighter.signTransaction(txXdr, {
      network: 'TESTNET',
      networkPassphrase: Networks.TESTNET,
    });
    const transaction = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET);
    const response = await server.sendTransaction(transaction as any);

    if (response.status === 'PENDING') {
      let txResponse = await server.getTransaction(response.hash);
      while (txResponse.status === 'NOT_FOUND') {
        await new Promise((r) => setTimeout(r, 1000));
        txResponse = await server.getTransaction(response.hash);
      }
      if (txResponse.status === 'SUCCESS') return response.hash;
      throw new NetworkError(txResponse.status);
    }
    throw new NetworkError('Transaction failed');
  } catch (error: any) {
    const msg = error?.message ?? '';
    if (msg.includes('User declined')) throw new UserRejectedError();
    if (msg.includes('insufficient')) throw new InsufficientFundsError();
    throw new NetworkError(msg);
  }
}

// ─── Feature fee: charge 0.5 XLM from user → treasury ───────────────────────
/**
 * Charges 0.5 XLM from `userAddress` to the treasury (ADMIN_ADDRESS).
 * Returns the transaction hash on success.
 */
export async function chargeFeature(userAddress: string): Promise<string> {
  const sourceAccount = await horizonServer.loadAccount(userAddress);

  const feeStroops = Math.round(FEATURE_FEE_XLM * 10_000_000).toString();

  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination: ADMIN_ADDRESS,
        asset: Asset.native(),
        amount: FEATURE_FEE_XLM.toFixed(7),
      })
    )
    .addMemo(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (TransactionBuilder as any).buildIncrement
        ? undefined
        : undefined
    )
    .setTimeout(30)
    .build();

  const hash = await signAndSubmitSWK(transaction.toXDR());
  return hash;
}

// ─── File fraud report on Clarix Registry ────────────────────────────────────
export async function fileReport(
  walletAddress: string,
  reportHash: string,
  reporterAddress: string
): Promise<string> {
  const sourceAccount = await server.getAccount(reporterAddress);
  const contract = new Contract(CLARIX_REGISTRY_ID);

  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      contract.call(
        'file_report',
        ...[
          new Address(walletAddress).toScVal(),
          xdr.ScVal.scvString(reportHash),
        ]
      )
    )
    .setTimeout(30)
    .build();

  const prepared = await server.prepareTransaction(transaction);
  const txHash = await signAndSubmitSWK(prepared.toXDR());
  return txHash;
}

// ─── Fetch wallet data from Horizon ──────────────────────────────────────────
export async function getWalletData(address: string) {
  try {
    const account = await horizonServer.loadAccount(address);
    const balance = account.balances.find((b) => b.asset_type === 'native')?.balance || '0';

    const txResponse = await horizonServer
      .transactions()
      .forAccount(address)
      .limit(20)
      .order('desc')
      .call();

    const transactions = txResponse.records.map((tx) => ({
      hash: tx.hash,
      created_at: tx.created_at,
      successful: tx.successful,
      fee_charged: tx.fee_charged,
      explorerUrl: stellarExpertTxUrl(tx.hash),
    }));

    return { balance, transactions };
  } catch (error) {
    console.error('Error fetching wallet data:', error);
    return { balance: '0', transactions: [] };
  }
}
