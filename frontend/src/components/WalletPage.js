import React, { useState } from 'react';
import '../stylesheets/WalletPage.css';  // Assuming this exists


const WalletPage = (props) => {
    const [filter, setFilter] = useState('All');
    const [receiverId, setReceiverId] = useState('');
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    // const [transactions, setTransactions] = useState([
    //     {
    //         id: 1,
    //         type: 'Received',
    //         date: '8:27 on 18 Sep 2024',
    //         from: '1B3qRz5g4dEF4DMPGT1L3TThzv6CvzNB',
    //         sealTokens: 20,
    //     },
    //     {
    //         id: 2,
    //         type: 'Sent',
    //         date: '2:14 on 15 Sep 2024',
    //         to: '1A72tpP5QGeiF2DMPfTT1S5LLmv7DivFNa',
    //         sealTokens: 15,
    //     },
    // ]);
    const transactions = props.transactions
    const setTransactions = props.setTransactions

    const [showModal, setShowModal] = useState(false);  // Modal visibility
    const [pendingTransaction, setPendingTransaction] = useState(null);  // Pending transaction
    const [notification, setNotification] = useState({ message: '', type: '' });

    const walletId = '13hgruwdGXvPyWFABDX6QBy';
  

    const filteredTransactions = transactions.filter((transaction) => {
        if (filter === 'All') return true;
        return transaction.type === filter;
    });

    // Function to handle wallet ID copy
    const copyToClipboard = () => {
        navigator.clipboard.writeText(walletId);
        showNotification("Wallet ID copied to clipboard!", 'success');
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });

        setTimeout(() => {
            setNotification({ message: '', type: '' });
        }, 3000);  // 3 seconds
    };

    // Check if balance is sufficient and prevent negative balance
    const handleTransfer = () => {
        const transferAmount = parseFloat(amount);

        // Ensure input is valid
        if (!receiverId || !amount || isNaN(transferAmount)) {
            showNotification("Please fill in the receiver ID and valid amount.", 'error');
            return;
        }

        // Ensure balance is sufficient
        if (transferAmount > props.sealTokenBalance) {
            showNotification("Insufficient balance for this transaction.", 'error');
            return;
        }

        // Prepare the transaction to be confirmed
        const transactionToConfirm = {
            id: transactions.length + 1,
            type: 'Sent',
            date: new Date().toLocaleString(),
            to: receiverId,
            sealTokens: transferAmount,
            reason: reason || 'No reason provided',
        };

        setPendingTransaction(transactionToConfirm);  // Set the pending transaction
        setShowModal(true);  // Show the modal
    };

    const confirmTransfer = () => {
        const transferAmount = pendingTransaction?.sealTokens;

        // Update transactions and balance
        setTransactions([...transactions, pendingTransaction]);

        // Update the balance, ensuring it doesn't go negative
        props.setSealTokenBalance((prevBalance) => {
            const updatedBalance = prevBalance - transferAmount;
            return parseFloat(updatedBalance.toFixed(2));  // Round to 2 decimal places
        });

        // Clear form fields and close modal
        setReceiverId('');
        setAmount('');
        setReason('');
        setShowModal(false);
        setPendingTransaction(null);
        showNotification("Transaction successful!", 'success');
    };

    return (
        <div className="wallet-page">
            {/* Notification */}
            {notification.message && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            {/* Top Section with Balance, Wallet ID, Earning/Spending */}
            <div className="top-section">
                <div className="card balance-card">
                    <h3>Current Balance</h3>
                    <p className="balance-amount">{props.sealTokenBalance.toFixed(2)} STK</p>  {/* Round displayed balance to 5 decimals */}
                </div>
                <div className="card wallet-id-card">
                    <h3>Wallet Address</h3>
                    <p className="wallet-id">
                        {walletId} 
                        <button onClick={copyToClipboard} className="copy-btn">Copy</button>
                    </p>
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
                        <div className="transaction-column">
                            <p className="transaction-status">{transaction.type} SealToken</p>
                            <p className="transaction-date">{transaction.date}</p>
                        </div>
                        <div className="transaction-column">
                            <p className="transaction-id">
                                {transaction.type === 'Sent' 
                                    ? `To: ${transaction.to}` 
                                    : `From: ${transaction.from}`}
                            </p>
                            <p className="transaction-reason">Reason: {transaction.reason || 'No reason provided'}</p>
                        </div>
                        <div className={`transaction-amount ${transaction.type.toLowerCase()}`}>
                            {transaction.type === 'Sent' 
                                ? `- ${transaction.sealTokens} STK` 
                                : `+ ${transaction.sealTokens} STK`}
                        </div>
                    </div>
                ))}
            </div>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Confirm Transaction</h3>
                        <p>This action cannot be undone. Check the following transaction details:</p>
                        <p><strong>Amount:</strong> {pendingTransaction?.sealTokens} STK</p>
                        <p><strong>Receiver ID:</strong> {pendingTransaction?.to}</p>
                        <p><strong>Reason:</strong> {pendingTransaction?.reason}</p>
                        <button onClick={confirmTransfer} className="confirm-button">Send</button>
                        <button onClick={() => setShowModal(false)} className="cancel-button">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalletPage;
