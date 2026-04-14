import { rpc, TransactionBuilder, Networks, BASE_FEE, Keypair, Contract, xdr, Address, Operation, Asset } from '@stellar/stellar-sdk';

// Constants
const CLARIX_REGISTRY_ID = 'CBLTKX433VCXF4TRKGNP4V26UAWJZ6YXC2VVXYGQM2NDIBFIQFTQZGTY';
const RPC_URL = 'https://soroban-testnet.stellar.org';
const server = new rpc.Server(RPC_URL);

async function run() {
  console.log('Generating testnet keypair...');
  const keypair = Keypair.random();
  console.log('Public Key:', keypair.publicKey());

  console.log('Funding via Friendbot...');
  const res = await fetch(`https://friendbot.stellar.org/?addr=${keypair.publicKey()}`);
  await res.json();
  console.log('Funded!');

  const sourceAccount = await server.getAccount(keypair.publicKey());
  const contract = new Contract(CLARIX_REGISTRY_ID);

  console.log('Building transaction...');
  const destination = Keypair.random();
  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination: destination.publicKey(),
        asset: Asset.native(),
        amount: "1.0",
      })
    )
    .setTimeout(30)
    .build();

  console.log('Preparing transaction...');
  let preparedTransaction = transaction;

  preparedTransaction.sign(keypair);

  console.log('Submitting transaction...');
  let response = await server.sendTransaction(preparedTransaction);

  if (response.status === 'PENDING') {
    console.log('Pending, waiting for confirmation...');
    let txResponse = await server.getTransaction(response.hash);
    while (txResponse.status === 'NOT_FOUND') {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      txResponse = await server.getTransaction(response.hash);
    }
    
    if (txResponse.status === 'SUCCESS') {
      console.log('SUCCESS! Transaction Hash:', response.hash);
    } else {
      console.error('Transaction Failed!', txResponse);
    }
  } else {
    console.error('Submission rejected!', response);
  }
}

run().catch(console.error);
