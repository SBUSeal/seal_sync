import React, { useState } from 'react';
import '../stylesheets/WalletPage.css';  // Assuming this exists

const WalletPage = (props) => {
    const [receiverId, setReceiverId] = useState('');
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const transactions = props.transactions;
    const setTransactions = props.setTransactions;

    const [showModal, setShowModal] = useState(false);  // Modal visibility
    const [pendingTransaction, setPendingTransaction] = useState(null);  // Pending transaction
    const [notification, setNotification] = useState({ message: '', type: '' });

    const walletId = '13hgruwdGXvPyWFABDX6QBy';

    // Sort transactions by date (newest first), keeping dummy transactions at the bottom
    const sortedTransactions = [...transactions].sort((a, b) => {
        if (a.id < 3 && b.id < 3) return 0; // Keep the dummy transactions at the bottom
        return new Date(b.date) - new Date(a.date); // Sort others by date
    });

    // Display only the first 5 transactions (recent ones)
    const displayedTransactions = sortedTransactions.slice(0, 5);

    // Function to format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

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
            date: new Date().toISOString(),  // Save as ISO to easily parse
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

            {/* Top Section with Balance, Wallet ID */}
            <div className="top-section">
                <div className="card balance-card">
                    <h3>Current Balance</h3>
                    <p className="balance-amount">{props.sealTokenBalance.toFixed(2)} STK</p>
                </div>
                <div className="card wallet-id-card">
                    <h3>Wallet Address</h3>
                    <p className="wallet-id">
                        {walletId} 
                        <button onClick={copyToClipboard} className="copy-btn">Copy</button>
                    </p>
                </div>
            </div>

            {/* Transfer Section */}
            <div className="transfer-section">
                <h3>Transfer SealTokens</h3>
                <div className="transfer-form">
                    <input 
                        type="text" 
                        placeholder="Receiver Address" 
                        value={receiverId}
                        onChange={(e) => setReceiverId(e.target.value)}
                        className="tranfer-field"
                    />
                    <input 
                        type="number" 
                        placeholder="Amount" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="tranfer-field"
                    />
                    <input 
                        type="text" 
                        placeholder="Reason (optional)" 
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="tranfer-field"
                    />
                    <button onClick={handleTransfer} className="primary-button">Send</button>
                </div>
            </div>

            {/* Transaction History */}
            <div className="transaction-history">
                <h3>Transaction History</h3>
                {displayedTransactions.map((transaction) => (
                    <div key={transaction.id} className="transaction-item">
                        <div className="transaction-column">
                            <p className="transaction-status">{transaction.type} SealToken</p>
                            <p className="transaction-date">{formatDate(transaction.date)}</p>
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

            {/* Show More Button */}
            {transactions.length > 5 && (
                <div className="show-more">
                    <button onClick={props.onShowMore} className="primary-button">
                        View All Transactions
                    </button>
                </div>
            )}

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
