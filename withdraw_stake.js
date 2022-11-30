const { StateClient } = require("@project-serum/anchor");
const {
  Lockup,
  sendAndConfirmTransaction,
  Authorized,
  PublicKey,
} = require("@solana/web3.js");
const {
  Connection,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
  StakeProgram,
} = require("@solana/web3.js");

const main = async () => {
  const connection = new Connection(clusterApiUrl("devnet"), "processed");
  const wallet = Keypair.generate();
  const airdropSignature = await connection.requestAirdrop(
    wallet.publicKey,
    1 * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(airdropSignature);

  const stakeAccount = Keypair.generate();
  const minimumRent = await connection.getMinimumBalanceForRentExemption(
    StakeProgram.space
  );
  const amountUserWantsToStake = 0.5 * LAMPORTS_PER_SOL;
  const amountToStake = minimumRent + amountUserWantsToStake;
  const createStakeAccountTx = StakeProgram.createAccount({
    authorized: new Authorized(wallet.publicKey, wallet.publicKey),
    fromPubkey: wallet.publicKey,
    lamports: amountToStake,
    lockup: new Lockup(0, 0, wallet.publicKey),
    stakePubkey: stakeAccount.publicKey,
  });
  const createStakeAccountTxId = await sendAndConfirmTransaction(
    connection,
    createStakeAccountTx,
    [wallet, stakeAccount]
  );
  console.log(`Stake account created. Tx id ${createStakeAccountTxId}`);
  let stakeBalance = await connection.getBalance(stakeAccount.publicKey);
  console.log(`Stake account balance ${stakeBalance / LAMPORTS_PER_SOL}`);
  let stakeStatus = await connection.getStakeActivation(stakeAccount.publicKey);
  console.log(`Stake account status ${stakeStatus.state}`);

  const validators = await connection.getVoteAccounts();
  const selectedValidator = validators.current[0];
  const selectedValidatorPubKey = new PublicKey(selectedValidator.votePubkey);
  const delegateTx = StakeProgram.delegate({
    stakePubkey: stakeAccount.publicKey,
    authorizedPubkey: wallet.publicKey,
    votePubkey: selectedValidatorPubKey,
  });

  const delegateTxId = await sendAndConfirmTransaction(connection, delegateTx, [
    wallet,
  ]);

  console.log(
    `Stake account delegate to ${selectedValidatorPubKey}. Tx id:${delegateTxId}`
  );

  stakeStatus = await connection.getStakeActivation(stakeAccount.publicKey);
  console.log(`Stake account status ${stakeStatus.state}`);

  const deactivateTx = StakeProgram.deactivate({
    stakePubkey: stakeAccount.publicKey,
    authorizedPubkey: wallet.publicKey,
  });

  const deactivateTxId = await sendAndConfirmTransaction(
    connection,
    deactivateTx,
    [wallet]
  );

  console.log(`Stake account deactivated. Tx Id ${deactivateTxId}`);

  stakeStatus = await connection.getStakeActivation(stakeAccount.publicKey);
  console.log(`Stake account status ${stakeStatus.state}`);

  const withdrowTx = StakeProgram.withdraw({
    stakePubkey: stakeAccount.publicKey,
    authorizedPubkey: wallet.publicKey,
    toPubkey: wallet.publicKey,
    lamports: stakeBalance,
  });
  const withdrowTxId = await sendAndConfirmTransaction(connection, withdrowTx, [
    wallet,
  ]);
  console.log(`Stake account withdrown. Tx Id ${withdrowTxId}`);
  stakeBalance = await connection.getBalance(stakeAccount.publicKey);
  console.log(`Stake account balance ${stakeBalance / LAMPORTS_PER_SOL}`);
};

const runMain = async () => {
  try {
    main();
  } catch (err) {
    console.error("runMain", err);
  }
};
runMain();
