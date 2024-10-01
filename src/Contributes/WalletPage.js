import React, {useState} from 'react';
import './WalletPage.css'; // Assume we create a separate CSS file for styling

const WalletPage = () => {
    // Initialize balance using useState
    const [sealTokenBalance, setSealTokenBalance] = useState(0);
    
    // Placeholder transactions (these will be dynamically loaded later from the backend)
  const transactions = [
    {
      id: 1,
      type: 'Received', // Sent or Received
      date: '8:27 on 18 Sep 2024',
      toFrom: 'To: SealToken Private Key Wallet',
      sealTokens: 20,
    },
    {
      id: 2,
      type: 'Sent',
      date: '2:14 on 15 Sep 2024',
      toFrom: 'From: 1A72tpP5QGeiF2DMPfTT1S5LLmv7DivFNa',
      sealTokens: 15,
    },
    // Add more transactions here
  ];
    return (
      <div className="wallet-page">
        {/* Balance section */}
        <div className="balance-section">
          <h2>Your SealToken Balance</h2>
          <p className="balance-amount">{sealTokenBalance}</p>
        </div>
  
        {/* The rest of the wallet page will go here later (like transaction history) */}
        <div className="transaction-section">
        <div className="transaction-buttons">
          <button className="btn-transaction active">All</button>
          <button className="btn-transaction">Sent</button>
          <button className="btn-transaction">Received</button>
        </div>
        <h3 className="transaction-title">Transaction History</h3>
      </div>

      {/* Transaction History */}
      <div className="transaction-history">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="transaction-item">
            <div className="transaction-details">
              <p className="transaction-type">{transaction.type} SealToken</p>
              <p className="transaction-date">{transaction.date}</p>
            </div>
            <div className="transaction-tofrom">{transaction.toFrom}</div>
            <div className="transaction-amount">{transaction.sealTokens} SealToken</div>
          </div>
        ))}
      </div>
      </div>
    );
  };

  export default WalletPage;