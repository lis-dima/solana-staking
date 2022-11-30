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
  const STAKE_PROGRAMM_ID = new PublicKey(
    "Stake11111111111111111111111111111111111111"
  );
  const VOTE_PUB_KEY = "vgcDar2pryHvMgPkKaZfh8pQy4BJxv7SpwUG7zinWjG";

  const accounts = await connection.getParsedProgramAccounts(
    STAKE_PROGRAMM_ID,
    {
      filters: [
        { dataSize: 200 },
        {
          memcmp: {
            offset: 124,
            bytes: VOTE_PUB_KEY,
          },
        },
      ],
    }
  );
  console.log(
    `Total number of delegators for ${STAKE_PROGRAMM_ID} is: ${accounts.length}`
  );
  if (accounts.length) {
    console.log(`Sample delegator: ${JSON.stringify(accounts[0])}`);
  }
};

const runMain = async () => {
  try {
    main();
  } catch (err) {
    console.error("runMain", err);
  }
};
runMain();
