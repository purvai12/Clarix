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
  Networks as WalletNetwork,
} from '@creit.tech/stellar-wallets-kit';
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { AlbedoModule } from '@creit.tech/stellar-wallets-kit/modules/albedo';
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull';
import { HanaModule } from '@creit.tech/stellar-wallets-kit/modules/hana';
import { LobstrModule } from '@creit.tech/stellar-wallets-kit/modules/lobstr';
import { createSponsoredTransaction } from './feeSponsorship';

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

// ─── Initialize Wallet Kit ───────────────────────────────────────────────────
// Using a getter to ensure the kit is initialized with all modules correctly.
let kitInstance: StellarWalletsKit | null = null;

export const getKit = () => {
  if (!kitInstance) {
    kitInstance = new StellarWalletsKit({
      network: WalletNetwork.TESTNET,
      modules: [
        new FreighterModule(),
        new AlbedoModule(),
        new xBullModule(),
        new HanaModule(),
        new LobstrModule(),
      ],
    });
  }
  return kitInstance;
};

// Also export the static instance for backward compat
export const kit = getKit();

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
// address is required for Soroban contracts that call require_auth() so
// Freighter/StellarWalletsKit can sign authorization entries, not just the envelope.
export async function signAndSubmitSWK(txXdr: string, signerAddress?: string): Promise<string> {
  try {
    const savedWalletId = localStorage.getItem('clarix_wallet_id') || 'freighter';
    console.log('SWK Sign Attempt:', { savedWalletId, signerAddress });

    if (savedWalletId) {
      try {
        (StellarWalletsKit as any).setWallet(savedWalletId);
      } catch (e) {
        console.warn('Wallet not found, re-initializing...', e);
        // Force re-init
        (StellarWalletsKit as any).init({
          network: WalletNetwork.TESTNET,
          modules: [
            new FreighterModule(),
            new AlbedoModule(),
            new xBullModule(),
            new HanaModule(),
            new LobstrModule(),
          ],
        });
        (StellarWalletsKit as any).setWallet(savedWalletId);
      }
    }

    const signResult = await (StellarWalletsKit as any).signTransaction(txXdr, {
      address: signerAddress,
    });
    const signedTxXdr = typeof signResult === 'string' ? signResult : signResult.signedTxXdr;

    const transaction = TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET);
    const txResponse = await server.sendTransaction(transaction as any);

    if (txResponse.status === 'PENDING') {
      let finalTx = await server.getTransaction(txResponse.hash);
      let attempts = 0;
      while (finalTx.status === 'NOT_FOUND' && attempts < 30) {
        await new Promise((r) => setTimeout(r, 1000));
        finalTx = await server.getTransaction(txResponse.hash);
        attempts++;
      }
      if (finalTx.status === 'SUCCESS') return txResponse.hash;
      throw new NetworkError(`Transaction failed on-chain: ${finalTx.status}`);
    }

    // Decode the XDR error for a human-readable message
    const errResult = (txResponse as any).errorResult;
    let errName = (txResponse as any).status;
    if (errResult?._attributes?.result?._switch?.name) {
      errName = errResult._attributes.result._switch.name;
    }
    console.error('Transaction injection failed:', txResponse.status, errName);
    throw new NetworkError(`Blockchain rejected the transaction: ${errName}`);
  } catch (error: any) {
    const msg = error?.message ?? '';
    if (msg.includes('User declined') || msg.includes('rejected') || msg.includes('cancel')) throw new UserRejectedError();
    if (msg.includes('insufficient')) throw new InsufficientFundsError();
    if (error instanceof NetworkError || error instanceof UserRejectedError || error instanceof InsufficientFundsError) throw error;
    throw new NetworkError(msg || 'Unknown error during transaction signing');
  }
}

/**
 * Sponsors a transaction by wrapping it in a fee bump and signing with Clarix Treasury.
 */
export async function sponsorAndSubmit(innerTxXdr: string): Promise<string> {
  const sponsorSecret = import.meta.env.VITE_SPONSOR_SECRET;
  if (!sponsorSecret) {
    throw new Error('VITE_SPONSOR_SECRET is not configured. Gasless transactions are disabled.');
  }

  const sponsoredXdr = await createSponsoredTransaction(innerTxXdr, sponsorSecret);
  
  // Submit to network
  const transaction = TransactionBuilder.fromXDR(sponsoredXdr, Networks.TESTNET);
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
  throw new NetworkError('Sponsored transaction submission failed');
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
        new Address(reporterAddress).toScVal(),
        xdr.ScVal.scvString(walletAddress),
        xdr.ScVal.scvString(reportHash),
        new Address(CLARIX_REWARD_ID).toScVal()
      )
    )
    .setTimeout(60)
    .build();

  // prepareTransaction sets the correct Soroban resource fees from simulation
  const prepared = await server.prepareTransaction(transaction);

  // Pass reporterAddress so StellarWalletsKit signs auth entries (fixes txBadAuth)
  const isGasless = !!import.meta.env.VITE_SPONSOR_SECRET;

  if (isGasless) {
    const signResult = await kit.signTransaction(prepared.toXDR(), {
      networkPassphrase: Networks.TESTNET,
      address: reporterAddress,
    });
    const signedInnerXdr = typeof signResult === 'string' ? signResult : signResult.signedTxXdr;
    return await sponsorAndSubmit(signedInnerXdr);
  } else {
    // Pass reporterAddress so Freighter signs the Soroban auth entries too
    return await signAndSubmitSWK(prepared.toXDR(), reporterAddress);
  }
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
