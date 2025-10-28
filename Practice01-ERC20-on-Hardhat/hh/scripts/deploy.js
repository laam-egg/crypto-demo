const hre = require("hardhat");

async function main() {
    const LAM_Token = await hre.ethers.getContractFactory("LAM_Token");
    const token = await LAM_Token.deploy(1_000_000 /*tokens*/);
    await token.deployed();
    console.log(`Token deployed to: ${await token.address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
