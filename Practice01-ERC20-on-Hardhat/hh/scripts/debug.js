import React, { useState } from 'react';
import { Card, Button, Input, Alert, Spin } from 'antd';
import { ethers } from 'ethers';

const TokenSaleDebugger = () => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [saleAddress, setSaleAddress] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const LAM_TOKEN_ABI = [
    "function balanceOf(address account) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function name() view returns (string)",
    "function symbol() view returns (string)"
  ];

  const SALE_ABI = [
    "function token() view returns (address)",
    "function owner() view returns (address)",
    "function rate() view returns (uint256)",
    "function buy() payable"
  ];

  const checkEverything = async () => {
    if (!window.ethereum) {
      setError("MetaMask not found!");
      return;
    }

    if (!tokenAddress || !saleAddress) {
      setError("Please enter both addresses!");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();

      // Connect to contracts
      const token = new ethers.Contract(tokenAddress, LAM_TOKEN_ABI, provider);
      const sale = new ethers.Contract(saleAddress, SALE_ABI, provider);

      // Get basic info
      const tokenName = await token.name();
      const tokenSymbol = await token.symbol();
      const decimals = await token.decimals();
      const totalSupply = await token.totalSupply();
      
      const saleOwner = await sale.owner();
      const saleTokenAddress = await sale.token();
      const rate = await sale.rate();

      // Get balances
      const userBalance = await token.balanceOf(userAddress);
      const ownerBalance = await token.balanceOf(saleOwner);
      const saleBalance = await token.balanceOf(saleAddress);

      // Get allowances
      const ownerToSaleAllowance = await token.allowance(saleOwner, saleAddress);
      const userToSaleAllowance = await token.allowance(userAddress, saleAddress);

      // Get ETH balance
      const userEthBalance = await provider.getBalance(userAddress);

      const info = {
        token: {
          address: tokenAddress,
          name: tokenName,
          symbol: tokenSymbol,
          decimals: decimals,
          totalSupply: ethers.utils.formatUnits(totalSupply, decimals)
        },
        sale: {
          address: saleAddress,
          owner: saleOwner,
          tokenAddress: saleTokenAddress,
          rate: rate.toString(),
          correctTokenLinked: saleTokenAddress.toLowerCase() === tokenAddress.toLowerCase()
        },
        user: {
          address: userAddress,
          ethBalance: ethers.utils.formatEther(userEthBalance),
          tokenBalance: ethers.utils.formatUnits(userBalance, decimals),
          allowanceToSale: ethers.utils.formatUnits(userToSaleAllowance, decimals)
        },
        owner: {
          address: saleOwner,
          tokenBalance: ethers.utils.formatUnits(ownerBalance, decimals),
          allowanceToSale: ethers.utils.formatUnits(ownerToSaleAllowance, decimals)
        },
        saleContract: {
          tokenBalance: ethers.utils.formatUnits(saleBalance, decimals)
        }
      };

      setDebugInfo(info);

      // Check for issues
      const issues = [];
      if (!info.sale.correctTokenLinked) {
        issues.push("❌ CRITICAL: Sale contract is linked to wrong token address!");
      }
      if (parseFloat(info.owner.tokenBalance) === 0) {
        issues.push("❌ Owner has ZERO tokens!");
      }
      if (parseFloat(info.owner.allowanceToSale) === 0) {
        issues.push("❌ Owner has NOT approved sale contract!");
      }
      if (parseFloat(info.user.ethBalance) < 0.001) {
        issues.push("⚠️ User has very low ETH balance!");
      }

      if (issues.length > 0) {
        setError(issues.join('\n'));
      }

    } catch (err) {
      console.error(err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testBuy = async () => {
    if (!debugInfo) {
      setError("Run diagnostics first!");
      return;
    }

    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const sale = new ethers.Contract(saleAddress, SALE_ABI, signer);

      // Try to buy 100 tokens (adjust based on rate)
      const tokensWanted = 100;
      const rate = parseFloat(debugInfo.sale.rate);
      const ethNeeded = tokensWanted / rate;

      console.log(`Attempting to buy ${tokensWanted} tokens for ${ethNeeded} ETH`);

      const tx = await sale.buy({
        value: ethers.utils.parseEther(ethNeeded.toString()),
        gasLimit: 300000
      });

      console.log("Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Transaction mined:", receipt);

      setError(`✅ SUCCESS! Transaction: ${tx.hash}`);
      await checkEverything(); // Refresh info

    } catch (err) {
      console.error("Buy failed:", err);
      setError(`Buy failed: ${err.reason || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: 'auto' }}>
      <Card title="🔍 Token Sale Debugger" style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 10 }}>
          <label>Token Address:</label>
          <Input
            placeholder="0x..."
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            style={{ marginBottom: 10 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Sale Contract Address:</label>
          <Input
            placeholder="0x..."
            value={saleAddress}
            onChange={(e) => setSaleAddress(e.target.value)}
            style={{ marginBottom: 10 }}
          />
        </div>
        <Button type="primary" onClick={checkEverything} loading={loading} block>
          🔍 Run Full Diagnostics
        </Button>
      </Card>

      {error && (
        <Alert
          message="Issues Found"
          description={<pre style={{ whiteSpace: 'pre-wrap' }}>{error}</pre>}
          type="error"
          closable
          style={{ marginBottom: 20 }}
        />
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      )}

      {debugInfo && (
        <>
          <Card title="📊 Diagnostic Results" style={{ marginBottom: 20 }}>
            <h3>Token Info</h3>
            <pre style={{ background: '#f5f5f5', padding: 10, borderRadius: 4 }}>
              {JSON.stringify(debugInfo.token, null, 2)}
            </pre>

            <h3>Sale Contract</h3>
            <pre style={{ background: '#f5f5f5', padding: 10, borderRadius: 4 }}>
              {JSON.stringify(debugInfo.sale, null, 2)}
            </pre>

            <h3>Your Account</h3>
            <pre style={{ background: '#f5f5f5', padding: 10, borderRadius: 4 }}>
              {JSON.stringify(debugInfo.user, null, 2)}
            </pre>

            <h3>Owner Account</h3>
            <pre style={{ background: '#f5f5f5', padding: 10, borderRadius: 4 }}>
              {JSON.stringify(debugInfo.owner, null, 2)}
            </pre>

            <h3>Sale Contract Balance</h3>
            <pre style={{ background: '#f5f5f5', padding: 10, borderRadius: 4 }}>
              {JSON.stringify(debugInfo.saleContract, null, 2)}
            </pre>
          </Card>

          <Card title="🧪 Test Transaction">
            <p>This will attempt to buy 100 tokens</p>
            <Button type="primary" onClick={testBuy} loading={loading} danger>
              🧪 Test Buy (100 tokens)
            </Button>
          </Card>
        </>
      )}
    </div>
  );
};

export default TokenSaleDebugger;