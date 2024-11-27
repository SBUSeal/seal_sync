import React, { useState } from 'react';
import '../stylesheets/LoginPage.css';
import SealLogo from '../images/Seal_Logo.png';

function LoginPage({ onLogin, onSignUp }) {
  const [walletAddress, setWalletAddress] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Check if wallet address is provided
    setErrorMessage('');
    if (walletAddress) {
      onLogin(walletAddress); // Callback to parent component
    } else {
      setErrorMessage('Please enter your Wallet Address.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-content">
        <div className="logo-container">
          <img src={SealLogo} alt="Seal Logo" className="seal-logo" />
        </div>
        <div className="login-container">
          <h2>Login</h2>
          {errorMessage && <p className="error-message" style={{ color: 'red' }}>{errorMessage}</p>}
          <form onSubmit={handleSubmit} style={{ width: "70%" }}>
            <div className="input-group">
              <label htmlFor="walletAddress">Wallet Address:</label>
              <input
                type="text"
                id="walletAddress"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter your wallet address"
              />
            </div>
            <div style={{ textAlign: 'center' }}>
              <button type="submit">Login</button>
            </div>
          </form>
          <p style={{ marginTop: 50, color: 'black' }}>Don't have a Wallet?
            <button onClick={onSignUp} style={{ marginLeft: 20 }} className="signup-button"> Generate Wallet </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
