import React, {useState} from 'react';
import sealImage from '../images/Seal_Logo.png';
import statusIcon from '../images/Status_Icon.png';
import filesIcon from '../images/File_Icon.png';
import walletIcon from '../images/Wallet_Icon.png';
import proxyIcon from '../images/Peers_Icon.png';
import settingsIcon from '../images/Settings_Icon.png';
import '../stylesheets/App.css';


function Sidebar(props) {

  const [isMinimized, setIsMinimized] = useState(false);

  const toggleSidebar = () => {
    setIsMinimized(!isMinimized);
  };

  const setActivePage = props.setActivePage;

  const handleSignOut = () => {
    // Logic for signing out (e.g., clearing user session, redirecting, etc.)
    console.log("User signed out");
  };

  return (
    <div className={`sidebar ${isMinimized ? 'sidebar-minimized' : ''}`}>
      <div className="logo">
        <img src={sealImage} alt="Seal Share Logo" className="sidebar-logo-image" />
        {!isMinimized && <h2>Seal Share</h2>}
      </div>
      <button onClick={toggleSidebar} className="minimize-btn">
        {isMinimized ? '>' : '<'}
      </button>
      <ul>
        <li onClick={() => setActivePage('Status')}>
          <img src={statusIcon} alt="Status Icon" className="sidebar-icon" />
          {!isMinimized && <span>Status</span>}
        </li>
        <li onClick={() => setActivePage('Files')}>
          <img src={filesIcon} alt="Files Icon" className="sidebar-icon" />
          {!isMinimized && <span>Files</span>}
        </li>
        <li onClick={() => setActivePage('Wallet')}>
          <img src={walletIcon} alt="Wallet Icon" className="sidebar-icon" />
          {!isMinimized && <span>Wallet</span>}
        </li>
        <li onClick={() => setActivePage('Proxy')}>
          <img src={proxyIcon} alt="Proxy Icon" className="sidebar-icon" />
          {!isMinimized && <span>Proxy</span>}
        </li>
        <li onClick={() => setActivePage('Mining')}>
          <img src={settingsIcon} alt="Mining Icon" className="sidebar-icon" />
          {!isMinimized && <span>Mining</span>}
        </li>
        <li onClick={() => setActivePage('Settings')}>
          <img src={settingsIcon} alt="Settings Icon" className="sidebar-icon" />
          {!isMinimized && <span>Settings</span>}
        </li>
      </ul>
      <div className="sign-out-container">
        <button onClick={handleSignOut} className="sign-out-button">Sign Out</button>
      </div>
    </div>
  );
}

export default Sidebar;