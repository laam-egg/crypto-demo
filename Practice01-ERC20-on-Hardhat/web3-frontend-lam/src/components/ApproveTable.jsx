import React, { useEffect, useState } from "react";
import { Table, Typography, Spin } from "antd";
import { ethers } from "ethers";

const { Title } = Typography;

const ApproveTable = ({ contract, userAddress }) => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!contract || !userAddress) return;

    const loadApprovals = async () => {
      try {
        setLoading(true);

        // Lọc các sự kiện Approval(owner == userAddress)
        const filter = contract.filters.Approval(userAddress, null);
        const events = await contract.queryFilter(filter, 0, "latest");

        // Duyệt qua từng event để lấy spender + allowance hiện tại
        const results = await Promise.all(
          events.map(async (e, index) => {
            const spender = e.args.spender;
            const approvedAmount = e.args.value;
            const currentAllowance = await contract.allowance(userAddress, spender);
            const balance = await contract.balanceOf(spender);

            return {
              key: index,
              spender,
              approvedAmount: ethers.utils.formatUnits(approvedAmount, 18),
              currentAllowance: ethers.utils.formatUnits(currentAllowance, 18),
              spenderBalance: ethers.utils.formatUnits(balance, 18),
              txHash: e.transactionHash,
            };
          })
        );

        // Loại bỏ trùng spender (chỉ giữ lần mới nhất)
        const unique = Object.values(
          results.reduce((acc, item) => {
            acc[item.spender] = item;
            return acc;
          }, {})
        );

        setApprovals(unique.reverse()); // Mới nhất lên đầu
      } catch (err) {
        console.error("Error loading approvals:", err);
      } finally {
        setLoading(false);
      }
    };

    loadApprovals();
  }, [contract, userAddress]);

  const columns = [
    {
      title: "Spender Address",
      dataIndex: "spender",
      key: "spender",
      render: (text) => (
        <a
          href={`https://etherscan.io/address/${text}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {text.slice(0, 10)}...
        </a>
      ),
    },
    {
      title: "Approved Amount",
      dataIndex: "approvedAmount",
      key: "approvedAmount",
    },
    {
      title: "Current Allowance",
      dataIndex: "currentAllowance",
      key: "currentAllowance",
    },
    {
      title: "Spender Balance",
      dataIndex: "spenderBalance",
      key: "spenderBalance",
    },
    {
      title: "Tx Hash",
      dataIndex: "txHash",
      key: "txHash",
      render: (text) => (
        <a
          href={`https://etherscan.io/tx/${text}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {text.slice(0, 12)}...
        </a>
      ),
    },
  ];

  return (
    <div style={{ marginTop: 32 }}>
      <Title level={4}>Approved Spenders</Title>
      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          columns={columns}
          dataSource={approvals}
          pagination={false}
          bordered
        />
      )}
    </div>
  );
};

export default ApproveTable;
