const { Connection, clusterApiUrl } = require("@solana/web3.js");

const main = async () => {
  const connection = new Connection(clusterApiUrl("devnet"), "processed");
  const { current, delinquent } = await connection.getVoteAccounts();
  console.log("All validators: ", current.concat(delinquent).length);
  console.log("All current: ", current.length);
};

const runMain = async () => {
  try {
    main();
  } catch (err) {
    console.error("runMain", err);
  }
};
runMain();
