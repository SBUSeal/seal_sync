import React, { useState, useEffect } from 'react';
import './stylesheets/App.css';
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
import TransactionsPage from './components/TransactionsPage';

function App() {
  const [activePage, setActivePage] = useState('Status');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [sealTokenBalance, setSealTokenBalance] = useState(100);
  const [currentProxy, setcurrentProxy] = useState(null);
  const [proxyHistory, setProxyHistory] = useState([]); 
  const [isOn, setIsOn] = useState(false); 
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [price, setPrice] = useState('');

  // State to manage Files
  const [files, setFiles] = useState([]);
  const [downloadsInProgress, setDownloadsInProgress] = useState([]);
  const [miningLog, setMiningLog] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState(0);
  const [downloadedFiles, setDownloadedFiles] = useState(0);

  // Log activePage to debug any unexpected reloads
  console.log("Current Active Page:", activePage);

  // Clear localStorage and reset the counters on page load
  useEffect(() => {
    setUploadedFiles(0);
    setDownloadedFiles(0);
  }, []);

  // State to manage transactions
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      type: 'Received',
      date: 'September 20 2024',
      from: '1B3qRz5g4dEF4DMPGT1L3TThzv6CvzNB',
      sealTokens: 20,
    },
    {
      id: 2,
      type: 'Sent',
      date: 'September 20 2024',
      to: '1A72tpP5QGeiF2DMPfTT1S5LLmv7DivFNa',
      sealTokens: 15,
    },
  ]);

  // Handle login
  const handleLogin = (walletAddress, privateKey) => {
    if (walletAddress && privateKey) {
      setIsLoggedIn(true);
    }
  };

  const handleSignUp = () => {
    setIsSigningUp(true);
  };

  // Handle sign-out
  const handleSignOut = () => {
    setIsLoggedIn(false);
    setIsSigningUp(false);
    setActivePage('');  // Debug: Make sure this is expected
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Function to render content based on activePage
  const renderContent = () => {
    if (isSigningUp) {
      return <SignUpPage setActivePage={setActivePage} setIsSigningUp={setIsSigningUp} setIsLoggedIn={setIsLoggedIn} />;
    }
    if (!isLoggedIn) {
      return <LoginPage onLogin={handleLogin} onSignUp={handleSignUp} />;
    }
    switch (activePage) {
      case 'Status':
        return <StatusPage downloadsInProgress={downloadsInProgress} />;
      case 'Files':
        return (
          <Files
            sealTokenBalance={sealTokenBalance}
            setSealTokenBalance={setSealTokenBalance}
            files={files}
            setFiles={setFiles}
            transactions={transactions}
            setTransactions={setTransactions}
            setDownloadsInProgress={setDownloadsInProgress}
          />
        );
      case 'Wallet':
        return (
          <WalletPage
            sealTokenBalance={sealTokenBalance}
            setSealTokenBalance={setSealTokenBalance}
            transactions={transactions}
            setTransactions={setTransactions}
            onShowMore={() => setActivePage('Transactions')}  
          />
        );
      case 'Proxy':
        return (
          <ProxyPage
            sealTokenBalance={sealTokenBalance}
            setSealTokenBalance={setSealTokenBalance}
            currentProxy={currentProxy}
            setcurrentProxy={setcurrentProxy}
            proxyHistory={proxyHistory}
            setProxyHistory={setProxyHistory}
            isOn={isOn}
            setIsOn={setIsOn}
            setTransactions={setTransactions}
            price={price}
            setPrice={setPrice}
          />
        );
      case 'Mining':
        return (
          <MiningPage
            sealTokenBalance={sealTokenBalance}
            setSealTokenBalance={setSealTokenBalance}
            miningLog={miningLog}
            setMiningLog={setMiningLog}
          />
        );
      case 'Settings':
        return <SettingsPage handleLogout={handleLogout} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />;
      case 'Transactions': // Handle when the active page is Transactions
        return (
          <TransactionsPage
            transactions={transactions}
            setTransactions={setTransactions}
          />
        );
        return <SettingsPage handleLogout={handleLogout} toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode}/>;
      default:
        return <h1>Connected to Seal Share</h1>;
    }
  };

  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : ''}`}>
      {isLoggedIn && <Sidebar setActivePage={setActivePage} activePage={activePage} onSignOut={handleSignOut} />}
      <div className="content">
        <div className="main-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default App;
