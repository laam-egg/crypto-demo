// src/components/TransferHistory.jsx
import React, { useEffect, useState } from "react";
import { Table, Typography, Spin } from "antd";
import { ethers } from "ethers";

const { Title } = Typography;

export default function TransferHistory({ contract, userAddress }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!contract || !userAddress) return;
    async function loadTransfers() {
      setLoading(true);
      try {
        // Lọc tất cả event Transfer
        const filter = contract.filters.Transfer(null, null);
        const events = await contract.queryFilter(filter, 0, "latest");

        const history = events.map((e) => ({
          key: e.transactionHash,
          blockNumber: e.blockNumber,
          from: e.args.from,
          to: e.args.to,
          amount: ethers.utils.formatUnits(e.args.value, 18),
          txHash: e.transactionHash,
        }));

        // Chỉ lấy event liên quan đến user
        const related = history.filter(
          (item) =>
            item.from.toLowerCase() === userAddress.toLowerCase() ||
            item.to.toLowerCase() === userAddress.toLowerCase()
        );

        // Sắp xếp ngược (mới nhất trước)
        setData(related.reverse());
      } catch (err) {
        console.error("Error fetching transfers:", err);
      } finally {
        setLoading(false);
      }
    }

    loadTransfers();
  }, [contract, userAddress]);

  const columns = [
    {
      title: "Block",
      dataIndex: "blockNumber",
      key: "blockNumber",
      sorter: (a, b) => a.blockNumber - b.blockNumber,
    },
    {
      title: "From",
      dataIndex: "from",
      key: "from",
      render: (text) => (
        <span title={text}>{text.slice(0, 6)}...{text.slice(-4)}</span>
      ),
    },
    {
      title: "To",
      dataIndex: "to",
      key: "to",
      render: (text) => (
        <span title={text}>{text.slice(0, 6)}...{text.slice(-4)}</span>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Tx Hash",
      dataIndex: "txHash",
      key: "txHash",
      render: (h) => (
        <a
          href={`https://etherscan.io/tx/${h}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {h.slice(0, 10)}...
        </a>
      ),
    },
  ];

  return (
    <div style={{ marginTop: 40 }}>
      <Title level={4}>Transfer History</Title>
      {loading ? (
        <Spin tip="Đang tải..." />
      ) : (
        <Table
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 5 }}
          bordered
        />
      )}
    </div>
  );
}
