import React, { useState } from 'react';
import './stylesheets/App.css';
import './stylesheets/LoginPage.css';
import './stylesheets/SignUpPage.css';
import Files from './components/FilesPage';
import StatusPage from './components/StatusPage';
import WalletPage from './components/WalletPage';
import Sidebar from './components/SideBar';
import SettingsPage from './components/SettingsPage';
import ProxyPage from './components/ProxyPage';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';

//import './Contributes/NavigationBar';
//import './Contributes/TopBar.js';


function App() {
  // State to manage which page is active
  const [activePage, setActivePage] = useState('Status');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false); 

  // State to manage Token Balance
  const [sealTokenBalance, setSealTokenBalance] = useState(100); //Change constant to reflect total wallet balance of dummy data
  const [currentProxy, setcurrentProxy] = useState(null); // State of current proxy being used



  //Handle login
  const handleLogin = (walletAddress, privateKey) => {
    //PLACEHOLDER LOGIC FOR NOW
    if (walletAddress && privateKey) {
      setIsLoggedIn(true);
    }
  };

  const handleSignUp = () => {
    // Navigate to Sign-Up page
    setIsSigningUp(true);
  };

  // Function to render content based on activePage
  const renderContent = () => 
    {
    if (isSigningUp) {
        return <SignUpPage />; // Render Sign-Up page
    }
    if(!isLoggedIn) {
      return <LoginPage onLogin={handleLogin} />
      //return <LoginPage onLogin={handleLogin} onSignUp={handleSignUp}/>;//Should show login page when not logged in. onSignUp will not be valid until you handleSignUP function is complete, and the Sign Up link is changed to button (See LoginPage.js)
    }
    switch (activePage) {
      case 'Status':
        return <StatusPage />;
      case 'Files':
        return <Files sealTokenBalance = {sealTokenBalance} setSealTokenBalance = {setSealTokenBalance}/>;
      case 'Wallet':
        return <WalletPage sealTokenBalance = {sealTokenBalance} setSealTokenBalance = {setSealTokenBalance}/>;
      case 'Proxy':
        return <ProxyPage sealTokenBalance = {sealTokenBalance} setSealTokenBalance = {setSealTokenBalance} currentProxy = {currentProxy}
          setcurrentProxy = {setcurrentProxy}
        />;
      case 'Settings':
        return <SettingsPage />;
      default:
        return <h1>Connected to Seal Share</h1>;
    }
  };

  return (
    <div className="App">
      {/* Only show sidebar when logged in */}
      {isLoggedIn && <Sidebar setActivePage={setActivePage} activePage={activePage} />}
      {/* Main Content */}
      <div className="content">
        {/* Topbar
        {isLoggedIn && (
        <div className="topbar">
          <input type="text" placeholder="Search..." className="search-input" />
        </div>
        )} */}
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