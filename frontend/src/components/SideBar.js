import React, {useState} from 'react';
import sealImage from '../images/Seal_Logo.png';
import statusIcon from '../images/Status_Page_White.png';
import filesIcon from '../images/File_Icon_White.png';
import walletIcon from '../images/Wallet_Icon.png';
import proxyIcon from '../images/Proxy_Icon_White.png';
import settingsIcon from '../images/Settings_Icon_White.png';
import miningIcon from '../images/pickaxe-white-removebg-preview.png';
import '../stylesheets/App.css';
import { ArrowLeftIcon, ArrowRightIcon} from '@radix-ui/react-icons';



function Sidebar(props) {

  const [isMinimized, setIsMinimized] = useState(false);

  const toggleSidebar = () => {
    setIsMinimized(!isMinimized);
  };

  const setActivePage = props.setActivePage;

  return (
    <div className={`sidebar ${isMinimized ? 'sidebar-minimized' : ''}`}>
      <div className="logo">
        <img src={sealImage} alt="Seal Share Logo" className="sidebar-logo-image" />
        {!isMinimized && <h2 className='logo-text'>Seal Share</h2>}
      </div>
      <button onClick={toggleSidebar} className="minimize-btn" style={{backgroundColor: "#34495E", height: 60, borderRadius: 5, marginBottom: 40}}>
        {isMinimized ? <ArrowLeftIcon color='white'> </ArrowLeftIcon> : <ArrowRightIcon color='white'> </ArrowRightIcon>}
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
          <img src={miningIcon} alt="Mining Icon" className="sidebar-icon" />
          {!isMinimized && <span>Mining</span>}
        </li>
        <li onClick={() => setActivePage('Settings')}>
          <img src={settingsIcon} alt="Settings Icon" className="sidebar-icon" />
          {!isMinimized && <span>Settings</span>}
        </li>
      </ul>

    </div>
  );
}

export default Sidebar;