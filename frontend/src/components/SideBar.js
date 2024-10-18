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

  // Function to toggle sidebar size
  const toggleSidebar = () => {
    setIsMinimized(!isMinimized);
  };

  const setActivePage = props.setActivePage;
  const activePage = props.activePage;

  console.log(activePage);
  
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
          {!isMinimized && <button>Status</button>}
        </li>
        <li onClick={() => setActivePage('Files')}>
          <img src={filesIcon} alt="Files Icon" className="sidebar-icon" />
          {!isMinimized && <button>Files</button>}
        </li>
        <li onClick={() => setActivePage('Wallet')}>
          <img src={walletIcon} alt="Wallet Icon" className="sidebar-icon" />
          {!isMinimized && <button>Wallet</button>}
        </li>
        <li onClick={() => setActivePage('Peers')}>
          <img src={proxyIcon} alt="Peers Icon" className="sidebar-icon" />
          {!isMinimized && <button>Peers</button>}
        </li>
        <li onClick={() => setActivePage('Settings')}>
          <img src={settingsIcon} alt="Settings Icon" className="sidebar-icon" />
          {!isMinimized && <button>Settings</button>}
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;