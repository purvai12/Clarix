import {
  TransactionBuilder,
  Transaction,
  Keypair,
  Networks,
  FeeBumpTransaction,
} from '@stellar/stellar-sdk';

/**
 * Wraps an inner transaction in a Fee Bump transaction sponsored by the Clarix Treasury.
 * @param innerTx The already signed (by user) transaction XDR.
 * @param sponsorSecret The secret key of the sponsoring account.
 * @returns The Fee Bump transaction XDR.
 */
export async function createSponsoredTransaction(
  innerTxXdr: string,
  sponsorSecret: string
): Promise<string> {
  const innerTx = TransactionBuilder.fromXDR(innerTxXdr, Networks.TESTNET) as Transaction;
  
  // The sponsor must be a valid Keypair
  const sponsorKeypair = Keypair.fromSecret(sponsorSecret);
  
  // Build the Fee Bump
  // The fee should be at least (inner fee + BASE_FEE)
  const feeBump = TransactionBuilder.buildFeeBumpTransaction(
    innerTx,
    sponsorKeypair.publicKey(),
    (parseInt(innerTx.fee) + 100).toString(), // Base fee + extra for safety
    Networks.TESTNET
  );

  // Sign with sponsor
  feeBump.sign(sponsorKeypair);

  return feeBump.toXDR();
}

/**
 * Checks if a transaction is a Fee Bump transaction.
 */
export function isFeeBump(tx: Transaction | FeeBumpTransaction): tx is FeeBumpTransaction {
  return (tx as any).innerTransaction !== undefined;
}
