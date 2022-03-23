const main = async () => {
  const [owner] = await hre.ethers.getSigners();

  const voteContractFactory = await hre.ethers.getContractFactory("Vote");
  const voteContract = await voteContractFactory.deploy();
  await voteContract.deployed();

  console.log("Contract deployed to:", voteContract.address);
  console.log("Contract deployed by: ", owner.address);

  await voteContract.seed();
  const candidates = await voteContract.getCandidates();

  console.log(Object.keys(candidates).map((key) => candidates[key][1]));
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
