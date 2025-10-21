// scripts/mint.js
const { upload } = require("./uploadToIpfs");
require("dotenv").config();

async function main() {
    // arguments via env or CLI
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const recipient = process.env.RECIPIENT;
    const filePath = process.env.FILE_PATH;
    const name = process.env.NFT_NAME;
    const description = process.env.NFT_DESCRIPTION;

    if (!contractAddress || !recipient || !filePath) {
        console.error("Missing some environment variables");
        process.exit(1);
    }

    // 1) upload image + metadata -> get tokenURI
    const tokenURI = await upload(filePath, name || "My NFT", description || "Minted via script");

    // 2) connect to contract and mint
    const MyNFT = await ethers.getContractFactory("MyNFT");
    const nft = MyNFT.attach(contractAddress);

    const tx = await nft.mintTo(recipient, tokenURI);
    console.log("Mint transaction sent, waiting for confirmation...");
    const receipt = await tx.wait();
    console.log("Minted. TxHash:", receipt.transactionHash);

    // find tokenId from Transfer event (if you want)
    // the contract increments tokenId starting from 1; we could fetch balanceOf or parse events.
    const filter = nft.filters.Transfer(null, recipient);
    const events = await nft.queryFilter(filter, receipt.blockNumber, receipt.blockNumber);
    console.log("Transfer events in receipt:", events.length ? events.map(e => ({ tokenId: e.args.tokenId.toString() })) : "none");
}

main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
