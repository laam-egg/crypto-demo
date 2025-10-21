import { useState, useEffect } from "react";
import { ethers } from "ethers";
import tokenAbi from '../../hh/artifacts/contracts/MyToken.sol/MyToken.json';

const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const [provider, setProvider] = useState();
  const [token, setToken] = useState();
  const [transfers, setTransfers] = useState([]);
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState("");

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const prov = new ethers.BrowserProvider(window.ethereum);
        setProvider(prov);

        const net = await prov.getNetwork();
        console.log("Connected network:", net.chainId);

        const tok = new ethers.Contract(tokenAddress, tokenAbi.abi, prov);
        setToken(tok);
      } else {
        alert("Please install MetaMask!");
      }
    };
    init();
  }, []);

  const connectWallet = async () => {
    const accs = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(accs[0]);
    setConnected(true);
  };

  // đọc lịch sử event Transfer
  const loadHistory = async () => {
    if (!token) return;
    const events = await token.queryFilter("Transfer", 0, "latest");

    const parsed = await Promise.all(
      events.map(async (ev) => {
        const block = await provider.getBlock(ev.blockNumber);
        return {
          from: ev.args.from,
          to: ev.args.to,
          value: ethers.formatUnits(ev.args.value, 18),
          tx: ev.transactionHash,
          time: new Date(block.timestamp * 1000).toLocaleString(),
        };
      })
    );

    setTransfers(parsed.reverse()); // newest first
  };

  // lắng nghe realtime
  useEffect(() => {
    if (!token) return;
    const handler = (from, to, value, event) => {
      const t = {
        from,
        to,
        value: ethers.formatUnits(value, 18),
        tx: event.transactionHash,
        time: new Date().toLocaleString(),
      };
      setTransfers((prev) => [t, ...prev]);
    };
    token.on("Transfer", handler);
    return () => token.off("Transfer", handler);
  }, [token]);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>MyToken Transfer History</h2>

      {!connected ? (
        <button onClick={connectWallet}>Connect MetaMask</button>
      ) : (
        <p>Connected as: {account}</p>
      )}

      <button onClick={loadHistory} disabled={!connected}>
        Load Transfer History
      </button>

      <table border="1" cellPadding="6" style={{ marginTop: "1rem" }}>
        <thead>
          <tr>
            <th>Time</th>
            <th>From</th>
            <th>To</th>
            <th>Value (MTK)</th>
            <th>Tx Hash</th>
          </tr>
        </thead>
        <tbody>
          {transfers.map((t, i) => (
            <tr key={i}>
              <td>{t.time}</td>
              <td>{t.from}</td>
              <td>{t.to}</td>
              <td>{t.value}</td>
              <td>{t.tx.slice(0, 10)}...</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
