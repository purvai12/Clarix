import {
  rpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Operation,
  Keypair,
  Contract,
  xdr,
  Address,
  Horizon,
} from '@stellar/stellar-sdk';

// Contract IDs
export const CLARIX_REGISTRY_ID = 'CBLTKX433VCXF4TRKGNP4V26UAWJZ6YXC2VVXYGQM2NDIBFIQFTQZGTY';
export const CLARIX_REWARD_ID = 'CDCLUCN5DQWEHQB3FWP7N6D6NT54WBWAXO5EZI6HCVFBZFT3AIAJCEX7';
export const ADMIN_ADDRESS = 'GDUSDXP3RR7FIY6JOAKPFKULKWJIR6QX4F7OXGAR5PAPGJSCNKATUFF7';

// Testnet RPC
// Testnet RPC & Horizon
const RPC_URL = 'https://soroban-testnet.stellar.org';
const HORIZON_URL = 'https://horizon-testnet.stellar.org';
export const server = new rpc.Server(RPC_URL);
export const horizonServer = new Horizon.Server(HORIZON_URL);

// Error types
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

// Check if Freighter is installed
export async function checkFreighter(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  return !!(window as any).freighter;
}

// Get Freighter public key
export async function getPublicKey(): Promise<string> {
  if (!(await checkFreighter())) {
    throw new Error('Freighter wallet not installed');
  }
  const publicKey = await (window as any).freighter.getPublicKey();
  return publicKey;
}

// Sign and submit transaction via Freighter
export async function signAndSubmit(xdr: string): Promise<string> {
  try {
    const signedXdr = await (window as any).freighter.signTransaction(xdr, {
      network: 'TESTNET',
      networkPassphrase: Networks.TESTNET,
    });

    const transaction = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET);
    const response = await server.sendTransaction(transaction as any);

    if (response.status === 'PENDING') {
      let txResponse = await server.getTransaction(response.hash);
      while (txResponse.status === 'NOT_FOUND') {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        txResponse = await server.getTransaction(response.hash);
      }

      if (txResponse.status === 'SUCCESS') {
        return response.hash;
      } else {
        throw new NetworkError(txResponse.status);
      }
    }

    throw new NetworkError('Transaction failed');
  } catch (error: any) {
    if (error.message.includes('User declined')) {
      throw new UserRejectedError();
    }
    if (error.message.includes('insufficient')) {
      throw new InsufficientFundsError();
    }
    throw new NetworkError(error.message);
  }
}

// File fraud report to Clarix Registry
export async function fileReport(
  walletAddress: string,
  reportHash: string,
  reporterAddress: string
): Promise<string> {
  try {
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
    const txHash = await signAndSubmit(prepared.toXDR());
    return txHash;
  } catch (error) {
    throw error;
  }
}

// Get wallet data from Horizon
export async function getWalletData(address: string) {
  try {
    const account = await horizonServer.loadAccount(address);
    const balance = account.balances.find((b) => b.asset_type === 'native')?.balance || '0';
    
    const txResponse = await horizonServer.transactions()
      .forAccount(address)
      .limit(10)
      .order('desc')
      .call();

    const transactions = txResponse.records.map((tx) => ({
      hash: tx.hash,
      created_at: tx.created_at,
      successful: tx.successful,
      fee_charged: tx.fee_charged,
    }));

    return {
      balance,
      transactions,
    };
  } catch (error) {
    console.error('Error fetching wallet data:', error);
    return {
      balance: '0',
      transactions: [],
    };
  }
}

// Get wallet risk score (mock implementation)
