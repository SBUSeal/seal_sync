import React, { useState } from 'react';

function LoginPage({ onLogin }) {
  const [walletAddress, setWalletAddress] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Check if wallet address and private key are provided
    if (walletAddress && privateKey) {
      onLogin(walletAddress, privateKey); // Callback to parent component
    } else {
      setErrorMessage('Please enter both Wallet Address and Private Key.');
    }
  };

  return (
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
            type="password" // Will add more security later
            id="privateKey"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder="Enter your private key"
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <p>
      Don't have a private key? <a href="/signup">Sign Up</a>
      {/*<button onClick={onSignUp}>Sign Up</button> */}{/* UNCOMMENT THIS BUTTON LINE WHEN THE handleSignUP function in LoginPage.js is complete */}
      </p>
    </div>
  );
}

export default LoginPage;
