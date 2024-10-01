import React, { useState } from 'react';
import './App.css';
import Files from './Contributes/Files';
import StatusPage from './Contributes/StatusPage';
import WalletPage from './Contributes/WalletPage';
import Sidebar from './Contributes/NavigationBar';
  
//import './Contributes/NavigationBar';
//import './Contributes/TopBar.js';


function App() {
  // State to manage which page is active
  const [activePage, setActivePage] = useState('Status');

  // Function to render content based on activePage
  const renderContent = () => {
    switch (activePage) {
      case 'Status':
        return <StatusPage />;
      case 'Files':
        return <Files />;
      case 'Wallet':
        return <WalletPage />;
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
      <Sidebar setActivePage = {setActivePage}> </Sidebar>
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