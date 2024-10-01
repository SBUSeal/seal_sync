import React from 'react';
import sealImage from './images/Seal_Logo.png';
import statusIcon from './src/images/Status_Icon.png';
import filesIcon from './src/images/File_Icon.png';
import walletIcon from './src/images/Wallet_Icon.png';
import peersIcon from './src/images/Peers_Icon.png';
import settingsIcon from './src/images/Settings_Icon.png';


function Sidebar() {
  return (
    <div className="sidebar">
      <div className="logo">
        <h2>Seal Share</h2>
        <img src={sealImage} alt="Seal Share Logo" className="sidebar-logo-image"/>
      </div>
      <ul>
      /* creating buttons for navigation bar */
        <li>
        <img src="/images/Status_Icon.png" alt="Status Icon" className="sidebar-icon" />
          Status</li>
        <li>
        <img src={filesIcon} alt="Files Icon" className="sidebar-icon" />
          Files</li>
        <li>
        <img src={walletIcon} alt="Wallet Icon" className="sidebar-icon" />
          Wallet</li>
        <li>
        <img src={peersIcon} alt="Peers Icon" className="sidebar-icon" />
          Peers</li>
        <li>
        <img src={settingsIcon} alt="Settings Icon" className="sidebar-icon" />
          Settings</li>
      </ul>
    </div>
  );
}

export default Sidebar;