import React from 'react';
import sealImage from '../images/Seal_Logo.png';
import statusIcon from '../images/Status_Icon.png';
import filesIcon from '../images/File_Icon.png';
import walletIcon from '../images/Wallet_Icon.png';
import proxyIcon from '../images/Peers_Icon.png';
import settingsIcon from '../images/Settings_Icon.png';
import '../stylesheets/App.css';


function Sidebar(props) {

  const setActivePage = props.setActivePage;
  const activePage = props.activePage;

  console.log(activePage);
  
  return (
    <div className="sidebar">
      <div className="logo">
        <h2>Seal Share</h2>
        <img src={sealImage} alt="Seal Share Logo" className="sidebar-logo-image"/>
      </div>
      <ul>
           <li>
            <img src={statusIcon} alt="Status Icon" className="sidebar-icon" />
            <button className={activePage === 'Status' ? 'active-bar' : ''} onClick={() => setActivePage('Status')}>Status</button>
            </li>
           <li>
            <img src={filesIcon} alt="Files Icon" className="sidebar-icon" />
            <button className={activePage === 'Status' ? 'active-bar' : ''} onClick={() => setActivePage('Files')}>Files</button>
           </li>
           <li>
            <img src={walletIcon} alt="Wallet Icon" className="sidebar-icon" />
            <button className={activePage === 'Status' ? 'active-bar' : ''} onClick={() => setActivePage('Wallet')}>Wallet</button>
            </li>
           <li>
            <img src={proxyIcon} alt="Peers Icon" className="sidebar-icon" />
            <button className={activePage === 'Status' ? 'active-bar' : ''} onClick={() => setActivePage('Proxy')}>Proxy</button>
            </li>
           <li>
           <img src={settingsIcon} alt="Settings Icon" className="sidebar-icon" />
            <button className={activePage === 'Status' ? 'active-bar' : ''} onClick={() => setActivePage('Settings')}>Settings</button>
            </li>
      </ul>
    </div>
  );
}

export default Sidebar;