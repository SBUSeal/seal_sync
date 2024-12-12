import React, { useEffect, useState } from 'react';
import '../stylesheets/ProxyPage.css';

// A variable of all proxies, getting that will be similar to getting all files or filtered files **
// When enable proxy is hit we are going to remove that proxy from the list
// Use file logic for making the proxy, each proxy have its own CID

const ProxyPage = ({ sealTokenBalance, setSealTokenBalance, currentProxy, setcurrentProxy, isOn, setIsOn, setTransactions, price, setPrice}) => { 
    
    const [isPriceEditing, setIsPriceEditing] = useState(price === '');  
    const [searchQuery, setSearchQuery] = useState('');  
    const [showHistory, setShowHistory] = useState(false); 
    const [host_data, setHostData] = useState(null)
    const [proxies, setProxies] = useState([])
    const [proxyHistory, setProxyHistory] = useState([]);
    const [filteredProxies, setFilteredProxies] = useState([]);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const showNotification = (message, type) => {
        if (
            notifStatus === 'None' ||
            (notifStatus === 'Urgent' && type !== 'error')
        ) {
            return;
        }
            setNotification({ message, type });
            setTimeout(() => {
                setNotification({ message: '', type: '' });
            }, 3000);
        };

    // GET req constantly getting
    useEffect(() => {
        const getProxies = async () => {
          console.log("REQUESTING FOR PROXIES");
          try {
            const response = await fetch('http://localhost:8080/proxies', {
              method: 'GET'
            });
            console.log("AFTER HERE IS REQUEST",response)
            const proxies = await response.json() || [];
            setProxies(proxies);
            setFilteredProxies(proxies)
            console.log("to json",proxies)
      
          } catch (error) {
            console.error("Error fetching proxies", error);
          }
        };
      
        // Initial fetch
        getProxies();
      
        // Schedule subsequent fetches every 2 minutes
        const intervalId = setInterval(getProxies, 120000); // 120000 milliseconds = 2 minutes
      
        // Cleanup the interval on component unmount
        return () => clearInterval(intervalId);
      
      }, []);


    // helper to get IP
    async function getIP(){
        try {
            const response = await fetch(`https://api.ipify.org?format=json`);
            const data = await response.json();
            return data.ip
        }
        catch(error) {
            console.log("Error fetching IP", error)
        }
    }

    // add proxy to the DHT
    async function enableProxy() {
        const formData = new FormData();
        // await until promise is resolved
        const ip_addr = await getIP();
        formData.append('ip', ip_addr);
        formData.append('price', price);
        formData.append('port', '8888');
        formData.append('dateAdded', new Date().toLocaleDateString())  
        try {
            const response = await fetch('http://localhost:8080/enableProxy', {
                method: 'POST',
                body: formData
            });
            if (response.ok) {
                const data = await response.json();
                setHostData(data);
                console.log("Proxy enabled:", data);
                return true;
            } else {
                console.error("Bad response code", response.statusText);
            }
        } catch (error) {
            console.error("Error enabling proxy mode", error);
        }
    }

    // disable proxy, not provide on dht
    async function disableProxy() {
        try {
            const response = await fetch('http://localhost:8080/disableProxy', {
                method: 'GET',
            });
            if (response.ok) {
                console.log(response)
                return true;
            } else {
                console.error("Bad response code", response.statusText);
            }
        } catch (error) {
            console.error("Error enabling proxy mode", error);
        }
    }

    // handle the enable and disable toggle
    const handleToggle = async () => {
        if (price === '') {
            //alert('Proxy Price Can Not Be Empty');
            showNotification('Proxy Price Can Not Be Empty', 'error');                                                                                                                                                                                     
        } else {
            const newIsOn = !isOn;
            setIsPriceEditing(false);
            setIsOn(newIsOn);
            // logic for adding proxy to DHT or removing / depending on what the toggle is
            if (newIsOn) {
                enableProxy()
            } else {
                disableProxy()
            }
        }
    };

    function readDate(x) {
        //  x is a string
        const date = new Date(x);
        const readableDate = date.toLocaleString('en-US', {
            year: 'numeric',  // "2024"
            month: 'long',    // "December"
            day: 'numeric',   // "11"
            hour: '2-digit',  // "10 AM" or "10 PM"
            minute: '2-digit',// "03"
            hour12: true      // Use AM/PM format
        });
        return readableDate
    }

    // handleprice change, save price and edit are for setting the price
    const handlePriceChange = (e) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
          setPrice(value);
        }
    };

    const savePrice = (e) => {
        e.preventDefault();
        setPrice(price);
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

    // Handling search
    function handleSearchInput(e) {
        const query = e.target.value;
        setSearchQuery(query);
        const filtered = proxies.filter(proxy =>
        proxy.walletAddress.toLowerCase().includes(query.toLowerCase()) ||
        proxy.location.region.toLowerCase().includes(query.toLowerCase()) ||
        proxy.location.ip.toLowerCase().includes(query.toLowerCase())
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

                {/* Notification Test Buttons
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
                </div>*/}

                {/* Notification */}
                {notification.message && (
                    <div className={`notification ${notification.type}`}>
                        {notification.message}
                    </div>
                )}

                {isOn && host_data &&(  
                <div className="proxy-form">
                    <div>
                        <p>Active Proxy Details:</p>
                        <p>Your IP: <strong>{host_data.ip}</strong></p>
                        <p>Connected Users: <strong>{host_data.connectedUsers}</strong></p>
                        <p>Data Transferred: <strong>{host_data.dataUsed} MB</strong></p>
                        <p>Price Rate: <strong>{host_data.price}</strong></p>
                        <p>Start Time <strong>{readDate(host_data.dateAdded)}</strong></p>
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


    const ProxyItem = ({ proxy, sealTokenBalance, setSealTokenBalance, setcurrentProxy, setProxyHistory, setTransactions, notifStatus}) => {
        const [notification, setNotification] = useState({ message: '', type: '' });
        const showNotification = (message, type) => {
            if (
            notifStatus === 'None' ||
            (notifStatus === 'Urgent' && type !== 'error')
            ) {
            return;
            }
            setNotification({ message, type });
            setTimeout(() => {
                setNotification({ message: '', type: '' });
            }, 3000);
        };
        const handlePurchase = (price) => {
        if (sealTokenBalance >= price) {
            //alert(`Purchase successful! You spent ${price} SealTokens.`);
            showNotification(`Purchase successful! You spent ${price} SealTokens.`, 'success');
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
            //alert('Insufficient balance.');
            showNotification('Insufficient balance.', 'error');
        }
    };
  
    return (
      <div className="proxy-item">
            <p>{proxy.walletAddress}</p>
            <p>{proxy.location.ip}</p>
            <p>{proxy.location.region}</p>
            <p><span className='proxy-price'>{proxy.price} STK/Day</span></p>
        <div className="proxy-join">
          <button className="purchase-button" onClick={() => handlePurchase(proxy.price)}>
           Select
          </button>
        </div>
      </div>
    );
  };
  
  export default ProxyPage;
