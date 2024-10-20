import React, { useState } from 'react';
import '../stylesheets/TransactionsPage.css';  // Assuming this exists

const TransactionsPage = (props) => {
    const [searchQuery, setSearchQuery] = useState(''); // Search query for transactions
    const [selectedMonth, setSelectedMonth] = useState('All'); // Month filter
    const transactions = props.transactions;

    // Available months for filtering
    const months = ['All', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Function to format the date as "Month day, year" (e.g., October 24, 2024)
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    // Filter transactions based on the search query and selected month
    const filteredTransactions = transactions.filter((transaction) => {
        const transactionMonth = new Date(transaction.date).toLocaleString('default', { month: 'long' });
        const matchesMonth = selectedMonth === 'All' || transactionMonth === selectedMonth;
        const matchesSearch = (transaction.date?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              transaction.reason?.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesMonth && matchesSearch;
    }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by newest on top

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
                    ))
                ) : (
                    <p>No transactions found.</p>
                )}
            </div>
        </div>
    );
};

export default TransactionsPage;
