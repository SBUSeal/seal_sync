import React, { useState, useEffect } from 'react';
import '../stylesheets/SignUpPage.css';
import SealLogo from '../images/Seal_Logo.png';

const SignUpPage = (props) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [walletName, setWalletName] = useState("");
  const [walletPassword, setWalletPassword] = useState("");
  const [copySuccess, setCopySuccess] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!walletPassword) {
      setErrorMessage("Please enter a secure wallet password.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/createWallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletName,
          walletPassword
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setWalletAddress(data.walletAddress); 
        setCopySuccess("");
        setErrorMessage("");
        // props.setActivePage("Status");
        // props.setIsSigningUp(false);
        // props.setIsLoggedIn(true);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Failed to create wallet. Please try again.");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please check your connection and try again.");
    }
  };

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

  return (
    <div className="signup-page">
      <div className="logo-container">
        <img src={SealLogo} alt="Seal Logo" className="seal-logo" />
      </div>
      <div className="signup-container">
        <div className="signup-form">
          <h2> Generate Wallet </h2>
          <form onSubmit={handleSignUp} style={{ width: "70%" }}>
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
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    style={{ marginLeft: "10px", padding: '5px 10px' }}
                  >
                    Copy
                  </button>
                </div>
                {copySuccess && <span style={{ marginLeft: "10px", color: "green" }}>{copySuccess}</span>}
                <button onClick={() => props.setActivePage("Login")} style={{marginLeft: "10px", padding: '5px 10px'}} type='button'> 
                  Back to Login 
                </button>
              </div>
            )}

            {!walletAddress && (
              <>
              <label htmlFor="walletName">Enter Wallet Name</label>
                <input
                  type="text"
                  id="walletName"
                  name="walletName"
                  placeholder="Enter a name for your wallet"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  required
                  style={{ display: "block", marginBottom: "10px" }}
                />
                <label htmlFor="walletPassword">Enter Wallet Password</label>
                <input
                  type="password"
                  id="walletPassword"
                  name="walletPassword"
                  placeholder="Enter a secure password"
                  value={walletPassword}
                  onChange={(e) => setWalletPassword(e.target.value)}
                  required
                  style={{ display: "block", marginBottom: "10px" }}
                />
                {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
                <div style={{ textAlign: 'center' }}>
                  <button type="submit" style={{ marginTop: "20px" }}>Sign Up</button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
