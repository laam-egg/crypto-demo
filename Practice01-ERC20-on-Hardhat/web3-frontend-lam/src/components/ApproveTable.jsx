import { Table } from "antd";

export default function ApproveTable({ approvals }) {
  const columns = [
    { title: "Owner", dataIndex: "owner", key: "owner" },
    { title: "Spender", dataIndex: "spender", key: "spender" },
    { title: "Amount", dataIndex: "amount", key: "amount" },
    {
      title: "Tx Hash",
      dataIndex: "txHash",
      key: "txHash",
      render: (hash) => (
        <a
          href={`https://sepolia.etherscan.io/tx/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {hash.slice(0, 12)}...
        </a>
      ),
    },
  ];

  return (
    <div style={{ marginTop: 30 }}>
      <h3>Approval History</h3>
      <Table
        columns={columns}
        dataSource={approvals}
        pagination={{ pageSize: 5 }}
      />
    </div>
  );
}
