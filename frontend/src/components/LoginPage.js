import React, { useState } from 'react';
import '../stylesheets/LoginPage.css';
import SealLogo from '../images/Seal_Logo.png';

function LoginPage({ handleDebug, onLogin, onSignUp, setGlobalWalletAddress}) {
  const [walletAddress, setWalletAddress] = useState('');
  const [walletPassword, setWalletPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (walletAddress) {
      setGlobalWalletAddress(walletAddress)
      onLogin(walletAddress, walletPassword);
    } else {
      setErrorMessage('Please enter your Wallet Address.');
    }
  };

  // const handlePasswordChange = (e) => {
  //   const inputPassword = e.target.value;
    // Ensure the password doesn't exceed the max length even if pasted
    // if (inputPassword.length <= maxwalletPasswordLength) {
    //   setwalletPassword(inputPassword);
    // }
  // };

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
                autoFocus
              />
              <label htmlFor="walletAddress">Wallet Password:</label>
              <input
                type="password"
                id="walletPassword"
                value={walletPassword}
                onChange={(e) => setWalletPassword(e.target.value)}
                placeholder="Enter your wallet password"
                autoFocus
              />
            </div>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button type="submit" className="login-button">
                Login
              </button>
             
            </div>
          </form>
          
          <p style={{ marginTop: 50, color: 'black' }}>
            Don't have a Wallet?
            <button
              onClick={onSignUp}
              className="signup-button"
              style={{ marginLeft: 20 }}
            >
              Generate Wallet
            </button>
            
          </p>
          <br/>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
