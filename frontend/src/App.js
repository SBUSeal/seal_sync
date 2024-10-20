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
import MiningPage from './components/MiningPage';

function App() {
  const [activePage, setActivePage] = useState('Status');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false); 

  const [sealTokenBalance, setSealTokenBalance] = useState(100); 
  const [currentProxy, setcurrentProxy] = useState(null); 

  // State to manage Files
  const [files, setFiles] = useState([]);
  const [miningLog, setMiningLog] = useState([]);

  //State to manage transactions
  const [transactions, setTransactions] = useState([
    {
        id: 1,
        type: 'Received',
        date: '8:27 on 18 Sep 2024',
        from: '1B3qRz5g4dEF4DMPGT1L3TThzv6CvzNB',
        sealTokens: 20,
    },
    {
        id: 2,
        type: 'Sent',
        date: '2:14 on 15 Sep 2024',
        to: '1A72tpP5QGeiF2DMPfTT1S5LLmv7DivFNa',
        sealTokens: 15,
    },
  ]);

  


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

  const handleLogout = () => {
    setIsLoggedIn(false); // Log the user out and navigate back to the login page
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
        return <Files sealTokenBalance = {sealTokenBalance} setSealTokenBalance = {setSealTokenBalance} files = {files} setFiles = {setFiles} transactions = {transactions} setTransactions = {setTransactions}/>;
      case 'Wallet':
        return <WalletPage sealTokenBalance = {sealTokenBalance} setSealTokenBalance = {setSealTokenBalance} transactions = {transactions} setTransactions = {setTransactions}/>;
      case 'Proxy':
        return <ProxyPage sealTokenBalance = {sealTokenBalance} setSealTokenBalance = {setSealTokenBalance} currentProxy = {currentProxy}
          setcurrentProxy = {setcurrentProxy}
        />;
      case 'Mining':
        return <MiningPage sealTokenBalance = {sealTokenBalance} setSealTokenBalance = {setSealTokenBalance} miningLog={miningLog} setMiningLog={setMiningLog}/>;
      case 'Settings':
        return <SettingsPage handleLogout={handleLogout}/>;
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