import React, { useState } from 'react';
import '../stylesheets/ProxyPage.css';

const ProxyPage = ({ sealTokenBalance, setSealTokenBalance, currentProxy, setcurrentProxy, proxyHistory, 
    setProxyHistory, isOn, setIsOn, setTransactions, price, setPrice, notifStatus}) => { 
    const [notification, setNotification] = useState({ message: '', type: '' });
    const showNotification = (message, type) => {
            setNotification({ message, type });
            setTimeout(() => {
                setNotification({ message: '', type: '' });
            }, 3000);
        };
    const proxies = [ 
        {
            id: 1,
            ip_addr: '41.77.0.1',
            host: '1B3qRz5g4dEF4DMPGT1L3TThzv6CvzNB',
            price: 5,
            location: 'Africa',
            bandwidth: 40,
            users: 2
        },
        {
            id: 2,
            ip_addr: '8.8.8.8',
            host: '1A72tpP5QGeiF2DMPfTT1S5LLmv7DivFNa',
            price: 200,
            location: 'North America',
            bandwidth: 50,
            users: 20
        },
        {
            id: 3,
            ip_addr: '95.165.0.1',
            host: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
            price: 30,
            location: 'Europe',
            bandwidth: 60,
            users: 3
        },
        {
            id: 4,
            ip_addr: '58.14.0.1',
            host: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kygt080',
            price: 45,
            location: 'Asia',
            bandwidth: 70,
            users: 5
          },
    ];

    const [isPriceEditing, setIsPriceEditing] = useState(price === '');  
    const [searchQuery, setSearchQuery] = useState('');  
    const [filteredProxies, setFilteredProxies] = useState(proxies);  
    const [showHistory, setShowHistory] = useState(false); 

    const host_data = { 
        ip_addr: '11.79.0.1',
        price: price,
        users: 5,
        dataTransferred: 1024, 
        latency: 50,
    };

    const handleToggle = () => {
        if (price === '') {
            alert('Proxy Price Can Not Be Empty')
        } else {
            const newIsOn = !isOn;
            setIsPriceEditing(false);
            setIsOn(newIsOn);
        }
    };

    const handlePriceChange = (e) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
          setPrice(value);
        }
    };

    const savePrice = (e) => {
        e.preventDefault();
        setPrice(price)
        if (price !== '') {
            setIsPriceEditing(false);  
        } 
        else {  
            setIsPriceEditing(true);  
        }
     };

    const editPrice = () => {
        setIsPriceEditing(true);
    };

    function handleSearchInput(e) {
        const query = e.target.value;
        setSearchQuery(query);
        const filtered = proxies.filter(proxy =>
        proxy.host.toLowerCase().includes(query.toLowerCase()) ||
        proxy.ip_addr.toLowerCase().includes(query.toLowerCase()) ||
        proxy.location.toLowerCase().includes(query.toLowerCase())
    );
        setFilteredProxies(filtered);
    }

    // Function to handle "All Notifications" test
    const handleTestAllNotifications = () => {
        if (notifStatus === 'All') {
            showNotification('This is a test for "All notifications" setting.', 'success');
        } 
    };

    // Function to handle "Urgent Notifications" test
    const handleTestUrgentNotifications = () => {
        if (notifStatus === 'All' || notifStatus === 'Urgent') {
            showNotification('This is a test for "Urgent notifications" setting.', 'success');
        }
    };

    const handleTestErrorNotifications = () => {
        showNotification('This is a test for error notifications.', 'error');
    };

    return (
        <div className="container">
            <div className="proxy-head">
                <div className='proxy-form'>
                    <div>
                        <button className={`toggle-button ${isOn ? 'on' : 'off'}`} onClick={handleToggle}>
                            {isOn ? 'Disable Proxy Mode' : 'Enable Proxy Mode'}
                        </button>
                    </div>
                    <div>
                        <h1>Set Proxy Price/Day</h1>
                        <form onSubmit={savePrice}>
                            <input
                                type="number"
                                value={price}
                                onChange={handlePriceChange}
                                placeholder="Enter Rate"
                                min="0"
                                readOnly={!isPriceEditing}
                                disabled={isOn} 
                                className={`price-input ${isPriceEditing ? 'editing' : 'saved'}`}
                                onClick={isOn ? null : editPrice}
                            />
                        </form>
                    </div>
                </div>

                {/* Notification Test Buttons */}
                <div className="notification-test-buttons">
                    <button
                        className="test-button"
                        onClick={handleTestAllNotifications}
                    >
                        Test All Notifications
                    </button>
                    <button
                        className="test-button"
                        onClick={handleTestUrgentNotifications}
                    >
                        Test Urgent Notifications
                    </button>
                </div>

                {/* Notification */}
                {notification.message && (
                    <div className={`notification ${notification.type}`}>
                        {notification.message}
                    </div>
                )}

                {isOn && (  
                <div className="proxy-form">
                    <div>
                        <p>Active Proxy Details:</p>
                        <p>Your IP: <strong>{host_data.ip_addr}</strong></p>
                        <p>Connected Users: <strong>{host_data.users}</strong></p>
                        <p>Data Transferred: <strong>{host_data.dataTransferred} MB</strong></p>
                        <p>Latency: <strong>50 ms</strong></p>
                    </div>
                </div>
                )}
            </div>
            
            
            {showHistory ? 
            (<ProxyHistoryPage setShowHistory = {setShowHistory} proxyHistory = {proxyHistory}/>
            ) :
            (   <div>
                {currentProxy ?
                (<PurchasedProxyPage proxyHistory = {proxyHistory} setShowHistory = {setShowHistory} currentProxy = {currentProxy} setcurrentProxy = {setcurrentProxy}/>
                ) : 
                (<AvailableProxyPage searchQuery = {searchQuery} handleSearchInput = {handleSearchInput} proxyHistory = {proxyHistory} 
                    setProxyHistory = {setProxyHistory} setShowHistory = {setShowHistory} filteredProxies = {filteredProxies} sealTokenBalance = {sealTokenBalance} 
                    setSealTokenBalance = {setSealTokenBalance} setcurrentProxy = {setcurrentProxy} setTransactions={setTransactions} proxies = {proxies}/>
                )}
                </div>
            )}
        </div>
    );
};

    const HistoryButton = ({ setShowHistory }) => {
        return (
            <button className="history-button" onClick={() => setShowHistory(true)}>
                Proxy History
            </button>
        );
    }

    const ProxyHistoryPage = ({setShowHistory, proxyHistory}) => {
        return (
            <div id="current-proxy-container">
                <div className="available-proxy-container">
                    {proxyHistory.length === 0 ? 
                    (<h1 style={{ textAlign: 'center', fontSize: '30px' }}>No Proxy History</h1>
                    ):  
                    (<h1 style={{ textAlign: 'center', fontSize: '30px' }}>Proxy History</h1>
                    )}
                    <button className="history-button" onClick={() => setShowHistory(false)}>
                        Back
                    </button>
                </div>
                <div className='categories'>
                    <p>Host</p>
                    <p>IP Address</p>
                    <p>Location</p>
                    <p>Price</p>
                    <p>Bandwidth</p>
                </div>
                <div className='proxy-list'>
                {proxyHistory.map((historyProxy) => (
                        <ProxyHistoryItem key={historyProxy.proxy.id} historyProxy={historyProxy}
                        />
                    ))}
                </div>
            </div>
        );
    }

    const ProxyHistoryItem = ({historyProxy}) => {
        return (
            <div className="proxy-item">
                <p>{historyProxy.proxy.host}</p>
                <p>{historyProxy.proxy.ip_addr}</p>
                <p>{historyProxy.proxy.location}</p>
                <p>{historyProxy.proxy.price} STK/Day</p>
                <p>{historyProxy.proxy.bandwidth} Mbps</p>
                <p>Used On: {historyProxy.timestamp}</p>
            </div>
        );
    }

    const PurchasedProxyPage = ({setShowHistory, currentProxy, setcurrentProxy}) => {
        const calculateDaysPassed = (timestamp) => {
            const purchaseDate = new Date(timestamp);
            const today = new Date();
            const diffTime = Math.abs(today - purchaseDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            return diffDays;
          };
        
        const daysPassed = calculateDaysPassed(currentProxy.timestamp);
        const totalCost = currentProxy.proxy.price * daysPassed;
        return (
            <div id="current-proxy-container">
                <div className="available-proxy-container">
                    <h1 style={{ textAlign: 'center', fontSize: '30px' }}>Current Proxy</h1>
                    <HistoryButton setShowHistory={setShowHistory} />
                </div>
                <div className='categories'>
                    <p>Host</p>
                    <p>IP Address</p>
                    <p>Location</p>
                    <p>Price</p>
                    <p>Total</p>
                </div>
                <div className='proxy-list'>
                    <div className="current-proxy-details">
                        <p>{currentProxy.proxy.host}</p>
                        <p>{currentProxy.proxy.ip_addr}</p>
                        <p>{currentProxy.proxy.location}</p>
                        <p>{currentProxy.proxy.price} STK/Day</p>
                        <p>{totalCost} STK</p>
                        <button className="disconnect-button" onClick={() => setcurrentProxy(null)}>
                            Disconnect
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    //didnt buy proxy shows list of proxies
    const AvailableProxyPage = ({searchQuery, handleSearchInput, setTransactions, setProxyHistory, setShowHistory, 
        filteredProxies, sealTokenBalance, setSealTokenBalance, setcurrentProxy, proxies}) => {
        return (
            <div> 
                <div className="available-proxy-container">
                    <input
                        type="text"
                        className="proxy-search-bar"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={handleSearchInput}
                    />
                    {proxies.length === 0 ?(<h1>No Available HTTP Proxies</h1>):(<h1>Available HTTP Proxies</h1>)}
                    <HistoryButton setShowHistory={setShowHistory}/>
                </div>
                <div className='categories'>
                    <p>Host</p>
                    <p>IP Address</p>
                    <p>Location</p>
                    <p>Price</p>
                    <p>Bandwidth</p>
                </div>
                <div className='proxy-list'>
                    {filteredProxies.map((proxy) => ( 
                        <ProxyItem key={proxy.id} proxy={proxy} sealTokenBalance ={sealTokenBalance}  setSealTokenBalance = {setSealTokenBalance}
                            setcurrentProxy = {setcurrentProxy} setProxyHistory = {setProxyHistory} setTransactions={setTransactions}
                        />
                    ))}
                </div>
            </div>
        );
    }


    const ProxyItem = ({ proxy, sealTokenBalance, setSealTokenBalance, setcurrentProxy, setProxyHistory, setTransactions}) => {
    
        const handlePurchase = (price) => {
        if (sealTokenBalance >= price) {
            alert(`Purchase successful! You spent ${price} SealTokens.`);
            setSealTokenBalance((prevBalance) => prevBalance - price);

            const historyProxy = {
                proxy,
                timestamp: new Date().toLocaleString(), 
            };
            setcurrentProxy(historyProxy);
            setProxyHistory((prevHistory) => [...prevHistory, historyProxy]);

            setTransactions((prevTransactions) => [...prevTransactions, {
                id: prevTransactions.length + 1,
                type: 'Sent',
                date: new Date().toLocaleString(),
                to: proxy.host,
                sealTokens: proxy.price,
                reason: 'Proxy Purchase',
            },] )
        } else {
            alert('Insufficient balance.');
        }
    };
  
    return (
      <div className="proxy-item">
            <p>{proxy.host}</p>
            <p>{proxy.ip_addr}</p>
            <p>{proxy.location}</p>
            <p><span className='proxy-price'>{proxy.price} STK/Day</span></p>
            <p>{proxy.bandwidth} Mbps</p>
        <div className="proxy-join">
          <button className="purchase-button" onClick={() => handlePurchase(proxy.price)}>
           Select
          </button>
        </div>
      </div>
    );
  };
  
  export default ProxyPage;
