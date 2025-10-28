const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);

  // 1️⃣ Deploy token
  const LAM_Token = await ethers.getContractFactory("LAM_Token");
  const lamToken = await LAM_Token.deploy(ethers.utils.parseEther("1000000"));
  await lamToken.deployed();
  console.log("LAM_Token deployed at:", lamToken.address);

  // 2️⃣ Deploy token sale
  const LAM_TokenSale = await ethers.getContractFactory("LAM_TokenSale");
  const lamTokenSale = await LAM_TokenSale.deploy(lamToken.address);
  await lamTokenSale.deployed();
  console.log("LAM_TokenSale deployed at:", lamTokenSale.address);

  // 3️⃣ Approve TokenSale được phép bán token
  const approveTx = await lamToken.approve(lamTokenSale.address, ethers.utils.parseEther("500000"));
  await approveTx.wait();
  console.log("Approved 500000 LAM tokens for sale.");

  console.log("✅ Deployment complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
