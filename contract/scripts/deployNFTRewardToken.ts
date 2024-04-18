import { ethers, run, network } from "hardhat";

async function main() {
  // Get network data from Hardhat config (see hardhat.config.ts).
  const networkName = network.name;
  
  // Check if the network is supported.
  if (networkName === "testnet" || networkName === "mainnet") {
    console.log(`Deploying to ${networkName} network...`);

    // Compile contracts.
    await run("compile");
    console.log("Compiled contracts...");

    const SAPE = await ethers.getContractFactory("SalchainToken");
    const sape = await SAPE.deploy();

    console.log("APE deployed to:", sape);
    console.log("APE deployed Address:", sape.target);

    await sape.waitForDeployment();

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
