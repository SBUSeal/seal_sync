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
  const [notifStatus, setNotifStatus] = useState('All');

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


  const handleDebug = () => {
    setActivePage("Status")
    setIsLoggedIn(true)
  }

  // Handle login
  const handleLogin = async (walletAddress, walletPassword) => {
    try {
      const response = await fetch("http://localhost:8080/loginWallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress, walletPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        setActivePage("Status")
        setIsLoggedIn(true)
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
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

  const toggleNotifUrgent = () => {
    setNotifStatus('Urgent');
    console.log('notifStatus set to "Urgent" in App.js');
  }

  const toggleNotifOff = () => {
    setNotifStatus('Off');
    console.log('notifStatus set to "None" in App.js');
  }

  const toggleNotifAll = () => {
    setNotifStatus('All');
    console.log('notifStatus set to "All" in App.js');
  }

  // Function to render content based on activePage
  const renderContent = () => {
    if (isSigningUp) {
      return <SignUpPage setActivePage={setActivePage} setIsSigningUp={setIsSigningUp} setIsLoggedIn={setIsLoggedIn} />;
    }
    if (!isLoggedIn) {
      return <LoginPage handleDebug={handleDebug} onLogin={handleLogin} onSignUp={handleSignUp} />;
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
            notifStatus={notifStatus}
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
            notifStatus={notifStatus} 
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
            notifStatus={notifStatus}
          />
        );
      case 'Mining':
        return (
          <MiningPage
            sealTokenBalance={sealTokenBalance}
            setSealTokenBalance={setSealTokenBalance}
            miningLog={miningLog}
            setMiningLog={setMiningLog}
            notifStatus={notifStatus}
          />
        );
      case 'Settings':
        return <SettingsPage handleLogout={handleLogout} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} notifStatus={notifStatus} setNotifStatus={setNotifStatus}/>;
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
