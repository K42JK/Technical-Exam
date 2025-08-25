import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with:", deployer.address);
  console.log("Deployer balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // 1. Deploy ZumelToken
  const Token = await ethers.getContractFactory("ZumelToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  console.log("ZumelToken deployed to:", await token.getAddress());

  // 2. Deploy ZumelNFT
  const NFT = await ethers.getContractFactory("ZumelNFT");
  const nft = await NFT.deploy(await token.getAddress(), deployer.address);
  await nft.waitForDeployment();
  console.log("ZumelNFT deployed to:", await nft.getAddress());

  // ---- Save deployment details ----
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  // Generate timestamp for filename
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[:.]/g, "-"); // safe for filenames

  const filePath = path.join(deploymentsDir, `deployed-${timestamp}.json`);

  const deploymentData = {
    network: "sepolia",
    deployer: deployer.address,
    token: await token.getAddress(),
    nft: await nft.getAddress(),
    timestamp: now.toISOString()
  };

  fs.writeFileSync(filePath, JSON.stringify(deploymentData, null, 2));
  console.log(`Deployment info saved to ${filePath}`);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
