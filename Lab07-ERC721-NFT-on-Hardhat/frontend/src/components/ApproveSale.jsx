import React, { useState, useEffect } from "react";
import { Card, InputNumber, Button, message } from "antd";
import { ethers } from "ethers";
import LAM_Token from "../../../hh/artifacts/contracts/LAM_Token.sol/LAM_Token.json";

const LAM_Token_ABI = LAM_Token.abi;

const ApproveSale = ({ tokenAddress, saleAddress }) => {
  const [amount, setAmount] = useState(1000);
  const [decimals, setDecimals] = useState(18);
  const [ownerBalance, setOwnerBalance] = useState(0);
  const [allowance, setAllowance] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchTokenInfo = async () => {
    if (!window.ethereum) return;
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const token = new ethers.Contract(tokenAddress, LAM_Token_ABI, provider);
      const signer = provider.getSigner();
      const ownerAddr = await signer.getAddress();

      const dec = await token.decimals();
      setDecimals(dec);

      const bal = await token.balanceOf(ownerAddr);
      setOwnerBalance(Number(ethers.utils.formatUnits(bal, dec)));

      const alw = await token.allowance(ownerAddr, saleAddress);
      setAllowance(Number(ethers.utils.formatUnits(alw, dec)));
    } catch (err) {
      console.error("Error fetching token info:", err);
    }
  };

  useEffect(() => {
    if (tokenAddress && saleAddress) {
      fetchTokenInfo();
    }
  }, [tokenAddress, saleAddress]);

  const handleApprove = async () => {
    if (!window.ethereum) return message.error("Vui lòng kết nối MetaMask.");
    
    try {
      setLoading(true);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const token = new ethers.Contract(tokenAddress, LAM_Token_ABI, signer);

      const valueToApprove = ethers.utils.parseUnits(amount.toString(), decimals);
      
      const tx = await token.approve(saleAddress, valueToApprove);
      message.info("Đang xử lý giao dịch...");
      
      await tx.wait();
      
      message.success(`Đã cấp phép ${amount} LAM cho sale contract.`); // Fixed: was using template literal incorrectly
      
      await fetchTokenInfo();
    } catch (err) {
      console.error(err);
      message.error(`Approve thất bại: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Cấp phép bán token (Owner)" style={{ maxWidth: 400, margin: "auto" }}>
      <p>Hợp đồng bán: {saleAddress?.slice(0, 10)}...</p>
      <p>Balance owner: {ownerBalance.toFixed(2)} LAM</p>
      <p>Allowance hiện tại: {allowance.toFixed(2)} LAM</p>
      <InputNumber
        min={1}
        step={100}
        value={amount}
        onChange={setAmount}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <Button type="primary" block loading={loading} onClick={handleApprove}>
        Cấp phép {amount} LAM
      </Button>
    </Card>
  );
};

export default ApproveSale;