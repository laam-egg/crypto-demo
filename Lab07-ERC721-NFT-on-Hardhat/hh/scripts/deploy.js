// scripts/deploy.js
async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with:", deployer.address);
    const MyNFT = await ethers.getContractFactory("MyNFT");
    const nft = await MyNFT.deploy("My Hardhat NFT", "MHN");
    await nft.deployed();
    console.log("MyNFT deployed to:", nft.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
