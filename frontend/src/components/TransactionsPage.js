import React, { useState } from 'react';
import '../stylesheets/TransactionsPage.css'; 

const TransactionsPage = (props) => {
    const [searchQuery, setSearchQuery] = useState(''); 
    const [selectedMonth, setSelectedMonth] = useState('All'); 
    const transactions = props.transactions;

   
    const months = ['All', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

   
    console.log(transactions)

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

    const convertCategory = (category) => {
        switch (category) {
            case 'send':
                return 'Sent';
            case 'receive':
                return 'Received';
            case 'generate':
                return 'Mined';
            case 'immature':
                return 'Pending';
            default:
                return 'Unknown';
        }
    };

   
    const filteredTransactions = transactions
    .filter((transaction) => {
        const transactionDate = new Date(transaction.time * 1000); // Convert Unix timestamp to Date
        const transactionMonth = transactionDate.toLocaleString('default', { month: 'long' }); // Get month name
        const matchesMonth = selectedMonth === 'All' || transactionMonth === selectedMonth; // Check month filter
        const matchesSearch =
            searchQuery === '' || // If no search query, match all
            transactionDate.toISOString().toLowerCase().includes(searchQuery.toLowerCase()) || // Check date match
            (transaction.comment?.toLowerCase() || '').includes(searchQuery.toLowerCase()); // Check reason match
        return matchesMonth && matchesSearch; // Apply both filters
    })
    .sort((a, b) => b.time - a.time); // Sort by transaction time in descending order


    return (
        <div className="transactions-page">
            <h3>Transaction History</h3>

            {/* Search and Filter Section */}
            <div className="search-filter-section">
                <div className="search-field">
                    <label htmlFor="search">Search Transactions</label>
                    <input
                        type="text"
                        id="search"
                        placeholder="Search by date or reason..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field"
                    />
                </div>
                <div className="filter-field">
                    <label htmlFor="month-filter">Filter by Month</label>
                    <select
                        id="month-filter"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="input-field"
                    >
                        {months.map((month) => (
                            <option key={month} value={month}>
                                {month}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Transaction History */}
            <div className="transaction-history">
                {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                        <div key={transaction.txid} className="transaction-item">
                            <div className="transaction-column">
                                <p className="transaction-status">{convertCategory(transaction.category.toLowerCase())} SealToken</p>
                                <p className="transaction-date">{formatDate(transaction.time*1000)}</p>
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
                    ))
                ) : (
                    <p>No transactions found.</p>
                )}
            </div>
        </div>
    );
};

export default TransactionsPage;
