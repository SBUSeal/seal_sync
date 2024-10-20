import React, { useState } from 'react';
import '../stylesheets/LoginPage.css';
import SealLogo from '../images/Seal_Logo.png';

function LoginPage({ onLogin, onSignUp }) {
  const [walletAddress, setWalletAddress] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const maxPrivateKeyLength = 64;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Check if wallet address and private key are provided
    setErrorMessage('');
    if(privateKey.length > maxPrivateKeyLength) {
        setErrorMessage(`Private key cannot exceed ${maxPrivateKeyLength} characters.`);
        return;
    }
    if (walletAddress && privateKey) {
      onLogin(walletAddress, privateKey); // Callback to parent component
    } else {
      setErrorMessage('Please enter both Wallet Address and Private Key.');
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
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
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
        <div className="input-group">
          <label htmlFor="privateKey">Private Key:</label>
          <input
            type="password"// Will add more security later
            id="privateKey"
            value={privateKey}
            maxLength={maxPrivateKeyLength}//Char limit for now
            onChange={(e) => {setPrivateKey(e.target.value);  setErrorMessage('');}}
            placeholder="Enter your private key"
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <p>Don't have a private key?
      <button onClick={onSignUp} classname="signup-button">Sign Up</button>{/* UNCOMMENT THIS BUTTON LINE WHEN THE handleSignUP function in LoginPage.js is complete */}
      </p>
    </div>
    </div>
    </div>
  );
}

export default LoginPage;
