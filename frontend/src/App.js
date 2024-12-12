import React, { useState, useEffect } from 'react';
import './stylesheets/App.css';
import './stylesheets/SignUpPage.css';
import Files from './components/FilesPage';
import WalletPage from './components/WalletPage';
import Sidebar from './components/SideBar';
import SettingsPage from './components/SettingsPage';
import ProxyPage from './components/ProxyPage';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import MiningPage from './components/MiningPage';
import TransactionsPage from './components/TransactionsPage';

const getBalanceEndpoint = "http://localhost:8080/getBalance";


function App() {
  
  const [globalWalletAddress, setGlobalWalletAddress] = useState(null);
  const [activePage, setActivePage] = useState('Login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [sealTokenBalance, setSealTokenBalance] = useState(0);
  const [currentProxy, setcurrentProxy] = useState(null);
  // const [proxyHistory, setProxyHistory] = useState([]); 
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
  const [isMining, setIsMining] = useState(false);

  useEffect(() => {
    setUploadedFiles(0);
    setDownloadedFiles(0);
  }, []);

  // State to manage transactions
  const [transactions, setTransactions] = useState([]);


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
        setActivePage("Files")
        setIsLoggedIn(true)
        fetchBalance()
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleSignUp = () => {
    // setIsSigningUp(true);
    setActivePage("SignUp")
  };

  // Handle sign-out
  const handleSignOut = () => {
    setIsLoggedIn(false);
    setIsSigningUp(false);
    setActivePage('');  // Debug: Make sure this is expected
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActivePage("Login")
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const fetchBalance = () => {
    fetch(getBalanceEndpoint, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to fetch balance: ${response.statusText}`);
            }
            return response.json();
        })
        .then((data) => {
            if (data.balance) {
                setSealTokenBalance(data.balance);
            }
        })
        .catch((error) => {
            console.error("Error fetching balance:", error);
        });
};

  // Function to render content based on activePage
  const renderContent = () => {
    // if (isSigningUp) {
      // return <SignUpPage setActivePage={setActivePage} setIsSigningUp={setIsSigningUp} setIsLoggedIn={setIsLoggedIn} />;
    // }
    // if (!isLoggedIn) {
    //   return <LoginPage handleDebug={handleDebug} onLogin={handleLogin} onSignUp={handleSignUp} setGlobalWalletAddress={setGlobalWalletAddress}/>;
    // }
    switch (activePage) {
      case "Login":
        return <LoginPage handleDebug={handleDebug} onLogin={handleLogin} onSignUp={handleSignUp} setGlobalWalletAddress={setGlobalWalletAddress}/>;
      case "SignUp":
        return <SignUpPage setActivePage={setActivePage} setIsSigningUp={setIsSigningUp} setIsLoggedIn={setIsLoggedIn} />;

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
            globalWalletAddress = {globalWalletAddress}
            sealTokenBalance={sealTokenBalance}
            setSealTokenBalance={setSealTokenBalance}
            transactions={transactions}
            setTransactions={setTransactions}
            onShowMore={() => setActivePage('Transactions')} 
            notifStatus={notifStatus} 
            fetchBalance={fetchBalance}
          />
        );
      case 'Proxy':
        return (
          <ProxyPage
            sealTokenBalance={sealTokenBalance}
            setSealTokenBalance={setSealTokenBalance}
            currentProxy={currentProxy}
            setcurrentProxy={setcurrentProxy}
            // proxyHistory={proxyHistory}
            // setProxyHistory={setProxyHistory}
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
            isMining={isMining}
            setIsMining={setIsMining}
            fetchBalance={fetchBalance}
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
