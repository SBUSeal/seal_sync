import React from 'react';
import sealImage from '../images/Seal_Logo.png';
import statusIcon from '../images/Status_Icon.png';
import filesIcon from '../images/File_Icon.png';
import walletIcon from '../images/Wallet_Icon.png';
import peersIcon from '../images/Peers_Icon.png';
import settingsIcon from '../images/Settings_Icon.png';
import '../stylesheets/App.css';


function Sidebar(props) {

  const setActivePage = props.setActivePage;
  return (
    <div className="sidebar">
      <div className="logo">
        <h2>Seal Share</h2>
        <img src={sealImage} alt="Seal Share Logo" className="sidebar-logo-image"/>
      </div>
      <ul>
        {/* <li>
        <img src={statusIcon} alt="Status Icon" className="sidebar-icon" />
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
          Settings</li> */}
           <li>
            <img src={statusIcon} alt="Status Icon" className="sidebar-icon" />
            <button onClick={() => setActivePage('Status')}>Status</button>
            </li>
           <li>
            <img src={filesIcon} alt="Files Icon" className="sidebar-icon" />
            <button onClick={() => setActivePage('Files')}>Files</button>
           </li>
           <li>
            <img src={walletIcon} alt="Wallet Icon" className="sidebar-icon" />
            <button onClick={() => setActivePage('Wallet')}>Wallet</button>
            </li>
           <li>
            <img src={peersIcon} alt="Peers Icon" className="sidebar-icon" />
            <button onClick={() => setActivePage('Peers')}>Peers</button>
            </li>
           <li>
           <img src={settingsIcon} alt="Settings Icon" className="sidebar-icon" />
            <button onClick={() => setActivePage('Settings')}>Settings</button>
            </li>
      </ul>
    </div>
  );
}

export default Sidebar;