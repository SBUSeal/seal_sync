import React, { useState, useEffect } from 'react';
import '../stylesheets/SignUpPage.css';
import SealLogo from '../images/Seal_Logo.png';

const SignUpPage = (props) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [walletPassword, setWalletPassword] = useState("");
  const [copySuccess, setCopySuccess] = useState("");

  // Generate a random 256-bit number (32 bytes)
  const generateRandomKey = () => {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  };

  // Automatically generate the wallet address when the component loads
  useEffect(() => {
    setWalletAddress(generateRandomKey());
  }, []);

  // Function to copy the wallet address to clipboard
  const copyToClipboard = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress).then(() => {
        setCopySuccess("Copied Address to Clipboard!");
      }, () => {
        setCopySuccess("Failed to copy");
      });
    }
  };

  const handleSignUp = (e) => {
    e.preventDefault()

    // if success
    props.setActivePage("Status")
    props.setIsSigningUp(false)
    props.setIsLoggedIn(true)

  }

  return (
    <div className="signup-page">
      <div className="logo-container">
        <img src={SealLogo} alt="Seal Logo" className="seal-logo" />
      </div>
      <div className="signup-container">
        <div className="signup-form">
          <h2> Generate Wallet </h2>
          <form onSubmit={handleSignUp} style={{width: "70%"}}>
            
            {walletAddress && (
              <div style={{ marginTop: '20px' }}>
                <label htmlFor="walletAddress">Your Wallet Address:</label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    id="walletAddress"
                    value={walletAddress}
                    readOnly
                    style={{ flex: 1 }}
                  />

                </div>
                <button
                    type="button"
                    onClick={copyToClipboard}
                    style={{marginBottom: "10px", padding: '5px 10px' }}
                  >
                    Copy
                  </button>
                {copySuccess && <span style={{marginLeft: "30px"}}>{copySuccess}</span>}
              </div>
            )}

        <label htmlFor="walletPassword">Enter Wallet Password</label>
            <input
              type="password"
              id="walletPassword"
              name="walletPassword"
              placeholder="Enter a secure password"
              value={walletPassword}
              onChange={(e) => setWalletPassword(e.target.value)}
              required
              style={{ display: "block" }}
            />
            <div style={{textAlign: 'center'}}>
              <button type='submit' style={{marginTop: "20px"}}> Sign Up </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;