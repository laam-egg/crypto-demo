const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

if (!CONTRACT_ADDRESS) {
  throw new Error("Please set VITE_CONTRACT_ADDRESS in your .env file");
}



function ipfsToHttp(url) {
  if (!url) return "";
  if (url.startsWith("ipfs://")) {
    return url.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  return url;
}



import React, { useEffect, useState } from "react";
import { Button, Table, Input, Space, Typography, message } from "antd";
import { ethers } from "ethers";
import CONTRACT_ABI_JSON from "../../hh/artifacts/contracts/MyNFT.sol/MyNFT.json";

const CONTRACT_ABI = CONTRACT_ABI_JSON.abi;

const { Title } = Typography;

export default function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [transferTo, setTransferTo] = useState("");

  // Kết nối MetaMask
  const connectWallet = async () => {
    if (!window.ethereum) {
      message.error("MetaMask chưa được cài!");
      return;
    }
    const prov = new ethers.providers.Web3Provider(window.ethereum);
    await prov.send("eth_requestAccounts", []);
    const signer = prov.getSigner();
    const addr = await signer.getAddress();

    setProvider(prov);
    setSigner(signer);
    setAccount(addr);

    const nftContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    setContract(nftContract);
  };

  // Lấy danh sách NFT user đang sở hữu
  const loadNFTs = async () => {
    if (!contract || !account) return;

    const balance = await contract.balanceOf(account);
    const total = balance.toNumber();
    const tokens = [];

    for (let i = 0; i < total; i++) {
      const tokenId = await contract.tokenOfOwnerByIndex(account, i);
      const tokenURI = await contract.tokenURI(tokenId);
      const metaRes = await fetch(ipfsToHttp(tokenURI));
      const meta = await metaRes.json();
      tokens.push({ key: i, tokenId: tokenId.toString(), tokenURI, image: ipfsToHttp(meta.image) });
    }

    setNfts(tokens);
  };

  // Chuyển NFT
  const transferNFT = async (tokenId) => {
    if (!transferTo) {
      message.warning("Nhập địa chỉ ví người nhận!");
      return;
    }
    try {
      const tx = await contract["safeTransferFrom(address,address,uint256)"](
        account,
        transferTo,
        tokenId
      );
      await tx.wait();
      message.success(`Chuyển NFT ${tokenId} thành công!`);
      loadNFTs();
    } catch (err) {
      console.error(err);
      message.error("Chuyển NFT thất bại!");
    }
  };

  // Tự động load NFT khi đã có account
  useEffect(() => {
    if (account && contract) loadNFTs();
  }, [account, contract]);

  const columns = [
    { title: "Token ID", dataIndex: "tokenId", key: "tokenId" },
    {
      title: "Ảnh NFT",
      dataIndex: "image",
      key: "image",
      render: (url) => <img src={url} alt="NFT" style={{ width: 80, borderRadius: 8 }} />,
    },
    { title: "Token URI", dataIndex: "tokenURI", key: "tokenURI" },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button type="primary" onClick={() => transferNFT(record.tokenId)}>
          Chuyển
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 32, maxWidth: 800, margin: "auto" }}>
      <Title level={2}>🎨 NFT Dashboard</Title>

      {!account ? (
        <Button type="primary" onClick={connectWallet}>
          Kết nối MetaMask
        </Button>
      ) : (
        <>
          <p><strong>Ví:</strong> {account}</p>
          <Space style={{ marginBottom: 16 }}>
            <Input
              placeholder="Nhập địa chỉ người nhận"
              value={transferTo}
              onChange={(e) => setTransferTo(e.target.value)}
              style={{ width: 400 }}
            />
            <Button onClick={loadNFTs}>Tải lại NFT</Button>
          </Space>
          <Table columns={columns} dataSource={nfts} bordered />
        </>
      )}
    </div>
  );
}
