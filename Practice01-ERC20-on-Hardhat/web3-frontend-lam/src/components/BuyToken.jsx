import React, { useState, useEffect } from "react";
import { Card, InputNumber, Button, message } from "antd";
import { ethers } from "ethers";
import LAM_TokenSale from "../../../hh/artifacts/contracts/LAM_TokenSale.sol/LAM_TokenSale.json";
import LAM_Token from "../../../hh/artifacts/contracts/LAM_Token.sol/LAM_Token.json";

const BuyToken = ({ saleAddress, tokenDecimal = 18 }) => {
  const [amountLam, setAmountLam] = useState(100);
  const [rate, setRate] = useState(null);
  const [ethCost, setEthCost] = useState(null);
  const [ownerBalance, setOwnerBalance] = useState(0);
  const [allowance, setAllowance] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (rate) setEthCost(amountLam / rate);
  }, [amountLam, rate]);

  const fetchSaleInfo = async () => {
    if (!window.ethereum) return;
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const sale = new ethers.Contract(saleAddress, LAM_TokenSale.abi, provider);

      // Get rate
      const rateValue = await sale.rate();
      setRate(Number(rateValue.toString()));

      // Get token address and owner
      const tokenAddress = await sale.token();
      const ownerAddress = await sale.owner();
      
      const token = new ethers.Contract(tokenAddress, LAM_Token.abi, provider);

      // Check owner's balance (not sale contract balance)
      const balance = await token.balanceOf(ownerAddress);
      setOwnerBalance(Number(ethers.utils.formatUnits(balance, tokenDecimal)));

      // Check allowance from owner to sale contract
      const alw = await token.allowance(ownerAddress, saleAddress);
      setAllowance(Number(ethers.utils.formatUnits(alw, tokenDecimal)));

    } catch (err) {
      console.error("Error fetching sale info:", err);
    }
  };

  useEffect(() => {
    if (saleAddress) {
      fetchSaleInfo();
    }
  }, [saleAddress]);

  const handleBuy = async () => {
    if (!window.ethereum) return message.error("Vui lòng kết nối MetaMask.");

    try {
      setLoading(true);
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const sale = new ethers.Contract(saleAddress, LAM_TokenSale.abi, signer);

      // Calculate ETH amount needed
      const ethAmount = amountLam / rate;

      // Check if there's enough allowance
      if (allowance < amountLam) {
        message.error(`Không đủ allowance! Cần ${amountLam} LAM, chỉ có ${allowance.toFixed(2)} LAM được phê duyệt.`);
        setLoading(false);
        return;
      }

      // Check if owner has enough tokens
      if (ownerBalance < amountLam) {
        message.error(`Owner không đủ token! Cần ${amountLam} LAM, chỉ có ${ownerBalance.toFixed(2)} LAM.`);
        setLoading(false);
        return;
      }

      // Send ETH to buy tokens (ETH has 18 decimals, not tokenDecimal)
      const tx = await sale.buy({
        value: ethers.utils.parseEther(ethAmount.toString())
      });

      message.info("Đang xử lý giao dịch...");
      await tx.wait();

      message.success(`Mua thành công ${amountLam} LAM bằng ${ethAmount.toFixed(6)} ETH`);
      
      await fetchSaleInfo();
    } catch (err) {
      console.error(err);
      const errorMsg = err.reason || err.message || "Giao dịch thất bại!";
      message.error(`Lỗi: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Mua LAM Token" style={{ maxWidth: 400, margin: "auto" }}>
      <p>Tỷ lệ: {rate ? `1 ETH = ${rate} LAM` : "Đang tải..."}</p>
      <p>Token owner có: {ownerBalance.toFixed(2)} LAM</p>
      <p>Allowance: {allowance.toFixed(2)} LAM</p>
      
      <InputNumber
        min={1}
        step={10}
        value={amountLam}
        onChange={setAmountLam}
        style={{ width: "100%", marginBottom: 10 }}
        placeholder="Số lượng LAM muốn mua"
      />
      
      <p style={{ fontWeight: 'bold' }}>
        Số ETH cần trả: {ethCost ? ethCost.toFixed(6) : "..."} ETH
      </p>
      
      <Button
        type="primary"
        block
        loading={loading}
        onClick={handleBuy}
        disabled={!rate || allowance < amountLam}
      >
        Mua {amountLam} LAM
      </Button>
      
      {allowance < amountLam && (
        <p style={{ color: 'red', marginTop: 10, fontSize: 12 }}>
          ⚠️ Cần cấp phép thêm token trước khi mua!
        </p>
      )}
    </Card>
  );
};

export default BuyToken;