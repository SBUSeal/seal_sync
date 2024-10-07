import React, {useState} from 'react';
import '../stylesheets/WalletPage.css'; // Assume we create a separate CSS file for styling

const WalletPage = () => {
    // Initialize balance using useState

    const [filter, setFilter] = useState('All');
    const [sealTokenBalance, setSealTokenBalance] = useState(0);
    
    //Placeholder transactions (these will be dynamically loaded later from the backend)
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
    // Can Add more transactions here before bracket
  ];

  // Filter transactions based on the current filter
  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'All') return true;
    return transaction.type === filter;
  });

    return (
      <div className="wallet-page">
        {/* Balance section */}
        <div className="balance-section">
          <h2>Your SealToken Balance</h2>
          <p className="balance-amount">{sealTokenBalance}</p>
        </div>
  
        {/* The transaction section with filter buttons */}
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
              <p className="transaction-address">{transaction.type === 'Sent' ? `To: ${transaction.to}` : `From: ${transaction.from}`}</p>
            </div>
            <div className="transaction-amount">{transaction.sealTokens} SealToken</div>
          </div>
        ))}
      </div>
      </div>
    );
  };

  export default WalletPage;