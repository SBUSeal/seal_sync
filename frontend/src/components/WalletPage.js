import React, { useState } from 'react';
import '../stylesheets/WalletPage.css'; // Assuming this exists

const WalletPage = () => {
    const [filter, setFilter] = useState('All');
    const [sealTokenBalance, setSealTokenBalance] = useState(100); // Example balance
    const [receiverId, setReceiverId] = useState('');
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');

    const walletId = '13hgruwdGXvPyWFABDX6QBy';

    const transactions = [
        {
            id: 1,
            type: 'Received',
            date: '8:27 on 18 Sep 2024',
            from: '1B3qRz5g4dEF4DMPGT1L3TThzv6CvzNB',
            sealTokens: 20,
        },
        {
            id: 2,
            type: 'Sent',
            date: '2:14 on 15 Sep 2024',
            to: '1A72tpP5QGeiF2DMPfTT1S5LLmv7DivFNa',
            sealTokens: 15,
        },
    ];

    const filteredTransactions = transactions.filter((transaction) => {
        if (filter === 'All') return true;
        return transaction.type === filter;
    });

    // Function to handle wallet ID copy
    const copyToClipboard = () => {
        navigator.clipboard.writeText(walletId);
        alert("Wallet ID copied to clipboard!");
    };

    // Function to handle token transfer (you can implement the actual transfer logic here)
    const handleTransfer = () => {
        if (!receiverId || !amount) {
            alert("Please fill in the receiver ID and amount.");
            return;
        }
        alert(`Transferred ${amount} SealTokens to ${receiverId} for ${reason || 'no reason provided'}.`);
        setReceiverId('');
        setAmount('');
        setReason('');
        // Add your logic to process the transfer here
    };

    return (
        <div className="wallet-page">
            {/* Top Section with Balance, Wallet ID, Earning/Spending */}
            <div className="top-section">
                <div className="card balance-card">
                    <h3>Current Balance</h3>
                    <p className="balance-amount">{sealTokenBalance} ORC</p>
                </div>
                <div className="card wallet-id-card">
                    <h3>Wallet ID</h3>
                    <p className="wallet-id">
                        {walletId} 
                        <button onClick={copyToClipboard} className="copy-btn">Copy</button>
                    </p>
                </div>
                <div className="card earning-card">
                    <h3>Monthly Earning</h3>
                    <p className="earning">100.00 ORC</p>
                </div>
                <div className="card spending-card">
                    <h3>Monthly Spending</h3>
                    <p className="spending">0.00 ORC</p>
                </div>
            </div>

            {/* Transfer Box */}
            <div className="transfer-section">
                <h3>Transfer SealTokens</h3>
                <div className="transfer-form">
                    <input 
                        type="text" 
                        placeholder="Receiver ID" 
                        value={receiverId}
                        onChange={(e) => setReceiverId(e.target.value)}
                        className="input-field"
                    />
                    <input 
                        type="number" 
                        placeholder="Amount" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="input-field"
                    />
                    <input 
                        type="text" 
                        placeholder="Reason " 
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="input-field"
                    />
                    <button onClick={handleTransfer} className="primary-button">Send</button>
                </div>
            </div>

            {/* Transaction Filters */}
            <div className="transaction-section">
                <div className="transaction-buttons">
                    <button
                        className={`btn-transaction ${filter === 'All' ? 'active' : ''}`}
                        onClick={() => setFilter('All')}
                    >
                        All
                    </button>
                    <button
                        className={`btn-transaction ${filter === 'Sent' ? 'active' : ''}`}
                        onClick={() => setFilter('Sent')}
                    >
                        Sent
                    </button>
                    <button
                        className={`btn-transaction ${filter === 'Received' ? 'active' : ''}`}
                        onClick={() => setFilter('Received')}
                    >
                        Received
                    </button>
                </div>
                <h3 className="transaction-title">Transaction History</h3>
            </div>

            {/* Transaction History */}
            <div className="transaction-history">
                {filteredTransactions.map((transaction) => (
                    <div key={transaction.id} className="transaction-item">
                        <div className="transaction-details">
                            <p className="transaction-type">{transaction.type} SealToken</p>
                            <p className="transaction-date">{transaction.date}</p>
                            <p className="transaction-address">
                                {transaction.type === 'Sent' ? `To: ${transaction.to}` : `From: ${transaction.from}`}
                            </p>
                        </div>
                        <div className="transaction-amount">{transaction.sealTokens} SealToken</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WalletPage;
