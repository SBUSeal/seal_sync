import React, { useState } from 'react';
import '../stylesheets/ProxyPage.css';

const ProxyPage = () => {
    const [isOn, setIsOn] = useState(false);
  
    const handleToggle = () => {
      setIsOn(!isOn); 
    };
  
    return (
      <div className="container">
        <div className="proxy-head">
          <div className="heading-container">
            <h1>Proxy Status</h1>
            <button
              className={`toggle-button ${isOn ? 'on' : 'off'}`}
              onClick={handleToggle}
            >
              {isOn ? 'On' : 'Off'}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default ProxyPage;
