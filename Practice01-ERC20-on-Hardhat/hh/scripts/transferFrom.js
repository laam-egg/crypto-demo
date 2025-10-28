// scripts/transferFrom.js
const { ethers } = require("hardhat");

async function main() {
  // --- Đọc biến môi trường ---
  const tokenAddress = process.env.TOKEN_ADDRESS;
  const owner = process.env.OWNER;       // địa chỉ chủ token (người approve)
  const spenderIndex = process.env.SPENDER_INDEX || 1; // chỉ số tài khoản trong local network
  const receiver = process.env.RECEIVER; // người nhận token
  const amountStr = process.env.AMOUNT || "10"; // số lượng token, ví dụ "10"

  if (!tokenAddress || !owner || !receiver) {
    console.error("❌ Missing environment variables: TOKEN_ADDRESS, OWNER, RECEIVER");
    process.exit(1);
  }

  // --- Lấy signers ---
  const signers = await ethers.getSigners();
  const spender = signers[spenderIndex]; // ví dụ: account #1 là spender

  console.log(`🔑 Spender: ${spender.address}`);
  console.log(`📤 Transfer from: ${owner}`);
  console.log(`📥 Transfer to:   ${receiver}`);
  console.log(`💰 Token:         ${tokenAddress}`);
  console.log(`💸 Amount:        ${amountStr}`);

  // --- Kết nối contract ---
  const Token = await ethers.getContractAt("LAM_Token", tokenAddress);
  const decimals = await Token.decimals();
  const amount = ethers.utils.parseUnits(amountStr, decimals);

  // --- Gọi transferFrom ---
  console.log("🚀 Sending transaction...");
  const tx = await Token.connect(spender).transferFrom(owner, receiver, amount);
  await tx.wait();

  console.log(`✅ TransferFrom successful! TX: ${tx.hash}`);
}

// Thực thi script
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
