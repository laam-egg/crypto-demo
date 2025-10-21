// scripts/uploadToIpfs.js
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
const FormData = require("form-data");
const axios = require("axios");
require("dotenv").config();

/**
 * Upload an image + metadata JSON to Pinata and return ipfs://CID/metadata.json
 */
async function upload(filePath, name, description, attributes = []) {
    const jwt = process.env.PIANTA_JWT_SECRET_ACCESS_TOKEN;
    if (!jwt) throw new Error("Missing PIANTA_JWT_SECRET_ACCESS_TOKEN in .env");

    // === 1. Upload image ===
    const form = new FormData();
    const data = await fs.promises.readFile(filePath);
    form.append("file", data, {
        filepath: path.basename(filePath),
        contentType: mime.lookup(filePath) || "application/octet-stream",
    });

    console.log("Uploading image to Pinata...");
    const fileRes = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", form, {
        maxBodyLength: Infinity,
        headers: {
            Authorization: `Bearer ${jwt}`,
            ...form.getHeaders(),
        },
    });
    const imageCid = fileRes.data.IpfsHash;
    const imageUri = `ipfs://${imageCid}`;
    console.log("✅ Image uploaded:", imageUri);

    // === 2. Upload metadata ===
    const metadata = {
        name,
        description,
        image: imageUri,
        attributes,
    };

    console.log("Uploading metadata...");
    const metaRes = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        metadata,
        {
            headers: {
                Authorization: `Bearer ${jwt}`,
                "Content-Type": "application/json",
            },
        }
    );
    const metaCid = metaRes.data.IpfsHash;
    const tokenURI = `ipfs://${metaCid}`;
    console.log("✅ Metadata uploaded:", tokenURI);

    return tokenURI;
}

// If run standalone
if (require.main === module) {
    const [, , filePath, name, description] = process.argv;
    if (!filePath) {
        console.error("Usage: node uploadToIpfs.js <filePath> <name> <description>");
        process.exit(1);
    }
    upload(filePath, name || "My NFT", description || "Minted NFT").then(console.log).catch(console.error);
}

module.exports = { upload };
