import React, { useState , useEffect} from 'react';
import '../stylesheets/WalletPage.css'; 
import { TrashIcon } from '@radix-ui/react-icons';

const WalletPage = (props) => {
    
    const [receiverId, setReceiverId] = useState('');
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const transactions = props.transactions;
    const setTransactions = props.setTransactions;
    

    const [showModal, setShowModal] = useState(false);  
    const [pendingTransaction, setPendingTransaction] = useState(null);  
    const [notification, setNotification] = useState({ message: '', type: '' });

    const sortedTransactions = [...transactions].sort((a, b) => {
        if (a.id < 3 && b.id < 3) return 0;
        return new Date(b.date) - new Date(a.date);
    });


    const displayedTransactions = sortedTransactions.slice(0, 5);


    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };


    const copyToClipboard = () => {
        navigator.clipboard.writeText(props.globalWalletAddress);
        showNotification("Wallet ID copied to clipboard!", 'success');
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification({ message: '', type: '' });
        }, 3000);
    };

  
    const handleTransfer = () => {
        const transferAmount = parseFloat(amount);
       
        if (!receiverId || !amount || isNaN(transferAmount)) {
            showNotification("Please fill in the receiver ID and valid amount.", 'error');
            return;
        }


        if (transferAmount > props.sealTokenBalance) {
            showNotification("Insufficient balance for this transaction.", 'error');
            return;
        }

       
        const transactionToConfirm = {
            id: transactions.length + 1,
            type: 'Sent',
            date: new Date().toISOString(),  
            to: receiverId,
            sealTokens: transferAmount,
            reason: reason || 'No reason provided',
        };

        setPendingTransaction(transactionToConfirm);  
        setShowModal(true);
    };

    const confirmTransfer = async () => {
        const transferAmount = pendingTransaction?.sealTokens;

        try {
            const response = await fetch("http://localhost:8080/sendToAddress", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    walletName: props.globalWalletAddress, 
                    recipientAddress: pendingTransaction?.to, 
                    amount: transferAmount, 
                    comment: pendingTransaction?.reason, 
                }),
            });
    
            if (!response.ok) {
                throw new Error(`Failed to send tokens: ${response.statusText}`);
            }
      
        props.setSealTokenBalance((prevBalance) => {
            const updatedBalance = prevBalance - transferAmount;
            return parseFloat(updatedBalance.toFixed(2)); 
        });

 
        setReceiverId('');
        setAmount('');
        setReason('');
        setShowModal(false);
        setPendingTransaction(null);
        showNotification("Transaction successful!", 'success');
    }
    catch (error) {
        console.error("Error sending tokens:", error);
        showNotification("Failed to complete the transaction.", 'error');
    }
}

const fetchTransactions = async () => {
    try {
        const response = await fetch("http://localhost:8080/getTransactions", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch transactions: ${response.statusText}`);
        }

        const data = await response.json();
        setTransactions(data);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        showNotification("Failed to load transactions.", "error");
    }
};

const convertCategory = (category) => {
    switch (category) {
        case 'send':
            return 'Sent';
        case 'received':
            return 'Received';
        case 'generate':
            return 'Mined';
        case 'immature':
            return 'Pending';
        default:
            return 'Unknown';
    }
};
    useEffect(() => {
        fetchTransactions();
    }, [props.sealTokenBalance]);


     //** Test Button Logic **
     const handleAllNotificationsTest = () => {
        console.log("Entered handleAllNotificationsTest with notifStatus: "+props.notifStatus);
        if (props.notifStatus === 'All') {
            showNotification("All Notifications Test Successful!", 'success');
        }
    };

    const handleUrgentNotificationsTest = () => {
        console.log("Entered handleUrgentNotificationsTest with notifStatus: "+props.notifStatus);
        if (props.notifStatus === 'All' || props.notifStatus === 'Urgent') {
            showNotification("Urgent Notifications Test Successful!", 'success');
        }
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
                        {props.globalWalletAddress} 
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

            {/* Test Buttons Section */}
            <div className="test-buttons">
                <h3>Test Notification Preferences</h3>
                <button 
                    onClick={handleAllNotificationsTest} 
                    className="test-button all-notifications"
                >
                    Test All Notifications
                </button>
                <button 
                    onClick={handleUrgentNotificationsTest} 
                    className="test-button urgent-notifications"
                >
                    Test Urgent Notifications
                </button>
            </div>

            {/* Transaction History */}
            <div className="transaction-history">
                <h3>Transaction History</h3>
                {displayedTransactions.map((transaction) => (
                    <div key={transaction.txid} className="transaction-item">
                        <div className="transaction-column">
                            <p className="transaction-status">{convertCategory(transaction.category.toLowerCase())} SealToken</p>
                            <p className="transaction-date">{formatDate(transaction.time * 1000)}</p>
                        </div>
                        <div className="transaction-column">
                            <p className="transaction-id">
                            {transaction.category === 'send'
                                    ? `To: ${transaction.address}` 
                                    : transaction.category === 'recieved' && `From: ${transaction.address}` }
                            </p>
                            <p className="transaction-reason">Reason: {transaction.comment || 'No reason provided'}</p>
                        </div>
                        <div className={`transaction-amount ${transaction.category.toLowerCase()}`}>
                            
                            {(transaction.type === 'recieved' || 'generated')
                                ? `${transaction.amount} STK` 
                                : `+ ${transaction.amount} STK`}
                        </div>
                    </div>
                ))}
            </div>

            {/* Show More Button */}
            {transactions.length > 1 && (
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
