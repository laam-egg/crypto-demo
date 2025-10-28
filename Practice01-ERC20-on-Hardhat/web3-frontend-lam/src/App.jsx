import React, { useState, useEffect } from "react";
import { Button, Input, Typography, message, Card } from "antd";
import { ethers } from "ethers";
import ApproveTable from "./components/ApproveTable";
import MyToken from "../../hh/artifacts/contracts/LAM_Token.sol/LAM_Token.json";

const { Title } = Typography;

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

if (!CONTRACT_ADDRESS) {
  throw new Error("Please set VITE_CONTRACT_ADDRESS in your .env file");
}

export default function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [userAddress, setUserAddress] = useState("");
  const [spender, setSpender] = useState("");
  const [amount, setAmount] = useState("");
  const [approvals, setApprovals] = useState([]);
  const [allowance, setAllowance] = useState(null);
  const [decimals, setDecimals] = useState(18);
  const [symbol, setSymbol] = useState("");
  const [balance, setBalance] = useState(0);

  // === Kết nối MetaMask ===
  const connectWallet = async () => {
    try {
      if (!window.ethereum) return message.error("MetaMask not found!");

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      const signer = provider.getSigner();
      const address = await signer.getAddress();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        MyToken.abi,
        signer
      );

      const dec = await contract.decimals();
      const sym = await contract.symbol();
      const balanceRaw = await contract.balanceOf(address);
      const formattedBalance = parseFloat(
        ethers.utils.formatUnits(balanceRaw, dec)
      ).toLocaleString();

      setBalance(formattedBalance);

      setDecimals(dec);
      setSymbol(sym);
      setProvider(provider);
      setSigner(signer);
      setContract(contract);
      setUserAddress(address);

      message.success(`Connected: ${address.slice(0, 10)}...`);
    } catch (err) {
      console.error(err);
      message.error("Connection failed");
    }
  };

  // === Hàm approve ===
  const handleApprove = async () => {
    if (!contract) return message.error("Connect MetaMask first!");
    if (!spender || !amount) return message.warning("Please fill all fields!");

    try {
      message.loading("⏳ Sending transaction...", 1);
      const tx = await contract.approve(
        spender,
        ethers.utils.parseUnits(amount, decimals)
      );
      await tx.wait();

      message.success("✅ Approve success!");

      // Thêm entry vào bảng
      const newEntry = {
        key: Date.now(),
        owner: userAddress,
        spender,
        amount,
        txHash: tx.hash,
      };
      setApprovals([newEntry, ...approvals]);

      // Cập nhật allowance
      fetchAllowance(spender);
    } catch (err) {
      console.error(err);
      message.error(`Transaction failed: ${err.message}`);
    }
  };

  // === Gọi allowance(owner, spender) ===
  const fetchAllowance = async (targetSpender) => {
    if (!contract || !userAddress || !targetSpender) return;
    try {
      const value = await contract.allowance(userAddress, targetSpender);
      const formatted = parseFloat(
        ethers.utils.formatUnits(value, decimals)
      ).toLocaleString();
      setAllowance(formatted);
    } catch (err) {
      console.error(err);
      setAllowance(null);
    }
  };

  // Khi spender thay đổi, tự fetch allowance
  useEffect(() => {
    if (spender) fetchAllowance(spender);
  }, [spender, contract, userAddress]);

  return (
    <div style={{ padding: 40, maxWidth: 800, margin: "auto" }}>
      <Title level={2}>ERC-20 Approve Dashboard</Title>

      {!userAddress ? (
        <Button type="primary" onClick={connectWallet}>
          🔗 Connect MetaMask
        </Button>
      ) : (
        <div>
          <p>Connected: <b>{userAddress}</b></p>
          <p>Balance: {balance} {symbol}</p>
        </div>
      )}

      <Card title="Approve Spender" style={{ marginTop: 20 }}>
        <Input
          placeholder="Spender address (0x...)"
          value={spender}
          onChange={(e) => setSpender(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        <Input
          placeholder={`Amount (${symbol})`}
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        <Button type="primary" onClick={handleApprove}>
          ✅ Approve
        </Button>

        {allowance !== null && (
          <p style={{ marginTop: 10 }}>
            💰 Current allowance for this spender:{" "}
            <b>
              {allowance} {symbol}
            </b>
          </p>
        )}
      </Card>

      <ApproveTable approvals={approvals} />
    </div>
  );
}
