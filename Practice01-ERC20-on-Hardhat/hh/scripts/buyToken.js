const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const [buyer] = await ethers.getSigners();

  const tokenSaleAddr = process.env.SALE_ADDRESS;
  if (!tokenSaleAddr) throw new Error("SALE_ADDRESS missing from .env");

  const lamSale = await ethers.getContractAt("LAM_TokenSale", tokenSaleAddr);

  console.log("Buying from:", lamSale.address);
  console.log("Buyer:", buyer.address);

  const tx = await lamSale.connect(buyer).buy({
    value: ethers.utils.parseEther("0.1"), // mua bằng 0.1 ETH
  });
  await tx.wait();

  console.log("✅ Bought tokens successfully!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
