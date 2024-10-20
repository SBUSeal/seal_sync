import React, { useState } from 'react';
import '../stylesheets//SignUpPage.css';
import SealLogo from '../images/Seal_Logo.png';

const SignUpPage = ({onSignUpSuccess}) => {
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
    if (!publicKey || !privateKey) {
        alert('Please generate your keys before signing up.');
        return;
    }
    console.log('Signing Up with:', { publicKey, privateKey });
    //For now, will route back to the login page.
    onSignUpSuccess();
  };

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
        <button onClick={onSignUpSuccess} class-name="button">Sign Up</button>
      </form>
      </div>
    </div>
    </div>
  );
};

export default SignUpPage;
