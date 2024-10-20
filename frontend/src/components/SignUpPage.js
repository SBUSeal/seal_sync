import React, { useState } from 'react';
import '../stylesheets//SignUpPage.css';
import SealLogo from '../images/Seal_Logo.png';

const SignUpPage = (props) => {
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');

  const generateKeys = () => {
    // Generate a random 256-bit number (32 bytes)
    const generateRandomKey = () => {
      const array = new Uint8Array(32);
      window.crypto.getRandomValues(array);
      return Array.from(array)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
    };

    const generatedPrivateKey = generateRandomKey();
    const generatedPublicKey = generateRandomKey();//PLACEHOLDER! Supposed to be derived from privateKey using blockchain?

    setPrivateKey(generatedPrivateKey);
    setPublicKey(generatedPublicKey);
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    //;PLACEHOLDER] Logic to handle the Sign-Up process
    //Send the keys to your backend or save them in your state (not sure)
    //Will probably be an async function

    // Validation: Check if keys are generated
    console.log("Public: ", publicKey, "Private: ", privateKey)
    if (!publicKey || !privateKey) {
        alert('Please generate your keys before signing up.');
        return;
    }
    console.log('Signing Up with:', { publicKey, privateKey });
    //For now, will route back to the login page.
    //onSignUpSuccess();
  };

  const downloadPrivateKey = () => {

    if(!privateKey) {
      alert('No private key generated yet!');
      return;
    }
    const blob = new Blob([privateKey], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'privateKey.txt';
    document.body.appendChild(link); // Append to body for Firefox compatibility
    link.click(); // Trigger download
    document.body.removeChild(link); // Clean up
  };

  const SignUpSuccess = () => {
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
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp}>
        <button type="button" onClick={generateKeys}>
          Generate Keys
        </button>
        {publicKey && (
          <div>
            <label>Public Key:</label>
            <textarea value={publicKey} readOnly />
          </div>
        )}
        {privateKey && (
          <div>
            <label>Private Key:</label>
            <textarea value={privateKey} readOnly />
          </div>
        )}
        <button type="button" onClick={downloadPrivateKey} className="download-button">Download Private Key</button>
        <button onClick={SignUpSuccess} class-name="button" type='submit'>Sign Up</button>
      </form>
      </div>
    </div>
    </div>
  );
};

export default SignUpPage;
