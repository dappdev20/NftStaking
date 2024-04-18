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

    const NFTStakingVault = await ethers.getContractFactory("NFTStakingVault");
    const stakingVault = await NFTStakingVault.deploy("0xFe19A7B93fdded81F3bc1F3b8cC01626d85974Db", "0x7A84eaaa1F391Db91c0979cA7976D0E5550fd258");

    console.log("APE deployed to:", stakingVault);
    console.log("APE deployed Address:", stakingVault.target);

    await stakingVault.waitForDeployment();

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
