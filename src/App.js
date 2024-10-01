import React, { useState } from 'react';
import './App.css';
import Files from './Contributes/Files';
  
//import './Contributes/NavigationBar';
//import './Contributes/TopBar.js';


function App() {
  // State to manage which page is active
  const [activePage, setActivePage] = useState('Status');

  // Function to render content based on activePage
  const renderContent = () => {
    switch (activePage) {
      case 'Status':
        return <h1>Status Page Content</h1>;
      case 'Files':
        return <Files />;
      case 'Wallet':
        return <h1>Wallet Page Content</h1>;
      case 'Peers':
        return <h1>Peers Page Content</h1>;
      case 'Settings':
        return <h1>Settings Page Content</h1>;
      default:
        return <h1>Connected to Seal Share</h1>;
    }
  };

  return (
    <div className="App">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">
          <h2>Seal Share</h2>
        </div>

        <ul>
          {/* Sidebar buttons that update the activePage state */}
          <li><button onClick={() => setActivePage('Status')}>Status</button></li>
          <li><button onClick={() => setActivePage('Files')}>Files</button></li>
          <li><button onClick={() => setActivePage('Wallet')}>Wallet</button></li>
          <li><button onClick={() => setActivePage('Peers')}>Peers</button></li>
          <li><button onClick={() => setActivePage('Settings')}>Settings</button></li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="content">
        {/* Topbar */}
        <div className="topbar">
          <input type="text" placeholder="Search..." className="search-input" />
        </div>

        {/* Main Area */}
        <div className="main-content">
          {/* Display content based on the active page */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default App;