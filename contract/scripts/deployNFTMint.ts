import { ethers, run, network } from "hardhat";

async function main() {
  // Get network data from Hardhat config (see hardhat.config.ts).
  const networkName = network.name;
  const baseURI = "ipfs://QmPYZ6TncLgNziPaa2LF6N1u1VpGvUE6ThkHvnYUf6tRVU";
  // Check if the network is supported.
  if (networkName === "testnet" || networkName === "mainnet") {
    console.log(`Deploying to ${networkName} network...`);

    // Compile contracts.
    await run("compile");
    console.log("Compiled contracts...");

    const NFTContract = await ethers.getContractFactory("NFTContract");
    const nft = await NFTContract.deploy(baseURI);
    try {
      await nft.waitForDeployment();
    } catch (e) {
      console.log('Failed Deploying.', e);
    }
    
    console.log("APE deployed to:", nft);
    console.log("APE deployed Address:", nft.target);

    // console.log("waiting for 6 blocks verification ...")
    // await nft.deploymentTransaction()?.wait(6)

    // await run("verify:verify", {
    //   address: nft.target,
    //   constructorArguments: [
    //     baseURI
    //   ],
    // });
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
