import React, { useState } from 'react';
import '../stylesheets/ProxyPage.css';

/* States */
const ProxyPage = ({ sealTokenBalance, setSealTokenBalance, currentProxy, setcurrentProxy, proxyHistory, 
    setProxyHistory, isOn, setIsOn, setTransactions}) => { // Destruct Properties
    const proxies = [   /* Dummy Data */
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

    const [price, setPrice] = useState(() => JSON.parse(localStorage.getItem('price')) || '');  /* State of Proxy Price */
    const [bandwidth, setBandwidth] = useState(() => JSON.parse(localStorage.getItem('bandwidth')) || '');  /* State of max bandwidth */
    const [isPriceEditing, setIsPriceEditing] = useState(price === '');   /* State of proxy price input */
    const [isBandEditing, setIsBandEditing] = useState(bandwidth === '');   /* State of bandwidth input */
    const [searchQuery, setSearchQuery] = useState('');  /* State of the search query */
    const [filteredProxies, setFilteredProxies] = useState(proxies);  /*State of filtered proxies*/
    const [showHistory, setShowHistory] = useState(false); // State if history button is shown

    const host_data = { // Dummy Data
        ip_addr: '11.79.0.1',
        price: price,
        users: 5,
        dataTransferred: 1024, 
        latency: 50,
    };

    /* Proxy on/off handler */
    const handleToggle = () => {
        if (price === '' || bandwidth === '') {
            alert('Proxy Price Or Bandwidth Can Not Be Empty')
        } else {
            const newIsOn = !isOn;
            setIsPriceEditing(false);
            setIsBandEditing(false);
            setIsOn(newIsOn);
            localStorage.setItem('proxy', JSON.stringify(newIsOn));
        }
    };

    /* Proxy input price handler */
    const handlePriceChange = (e) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
          setPrice(value);
        }
    };

    /* proxy price saving */
    const savePrice = (e) => {
        e.preventDefault();
        if (price !== '') { /* submitting price that is a valid number */
            localStorage.setItem('price', JSON.stringify(price));
            setIsPriceEditing(false);  /* after enter, save and set input into css save mode */
        } 
        else {  /* submitting empty field */
            localStorage.setItem('price', JSON.stringify(''));
            setIsPriceEditing(true);  /* after enter, save and set input into css save mode */
        }
     };

    /* form on click = editing, changes css */
    const editPrice = () => {
        setIsPriceEditing(true);
    };

    /* Proxy input price handler */
    const handleBandwidthChange = (e) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
          setBandwidth(value);
        }
    };

    /* proxy max bandwidth */
    const saveBandwidth = (e) => {
        e.preventDefault();
        if (bandwidth !== '') { /* submitting price that is a valid number */
            localStorage.setItem('bandwidth', JSON.stringify(bandwidth));
            setIsBandEditing(false);  /* after enter, save and set input into css save mode */
        } 
        else {  /* submitting empty field */
            localStorage.setItem('bandwidth', JSON.stringify(''));
            setIsBandEditing(true);  /* after enter, save and set input into css save mode */
        }
     };

    const editBand = () => {
        setIsBandEditing(true);
    };

    // Handle search query input
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
  
    return (
        <div className="container">
            {/* Self Proxy Section */}
            <div className="proxy-head">
                <div className='proxy-form'>
                    <div>
                        <button className={`toggle-button ${isOn ? 'on' : 'off'}`} onClick={handleToggle}>
                            {isOn ? 'Disable Proxy Mode' : 'Enable Proxy Mode'}
                        </button>
                    </div>
                    <div>
                        <h1>Proxy Price</h1>
                        {/* Price Input Form */}
                        <form onSubmit={savePrice}>
                            <input
                                type="number"
                                value={price}
                                onChange={handlePriceChange}
                                placeholder="Enter SealToken Price"
                                min="0"
                                readOnly={!isPriceEditing}
                                disabled={isOn} 
                                className={`price-input ${isPriceEditing ? 'editing' : 'saved'}`}
                                onClick={isOn ? null : editPrice}
                            />
                        </form>
                    </div>
                    <div>
                        <h1>Maximum Bandwdith</h1>
                        {/* Bandwidth Input Form */}
                        <form onSubmit={saveBandwidth}>
                            <input
                                type="number"
                                value={bandwidth}
                                onChange={handleBandwidthChange}
                                placeholder="Enter Bandwdith"
                                min="0"
                                readOnly={!isBandEditing}
                                disabled={isOn} 
                                className={`price-input ${isBandEditing ? 'editing' : 'saved'}`}
                                onClick={isOn ? null : editBand}
                            />
                        </form>
                    </div>
                </div>
                {isOn && (  // If proxy on share metrics about the proxy
                <div className="proxy-form">
                    <div>
                        <p>Active Proxy Details:</p>
                        <p>Your IP: {host_data.ip_addr}</p>
                        <p>Connected Users: {host_data.users}</p>
                        <p>Data Transferred: {host_data.dataTransferred} MB</p>
                        <p>Latency: {host_data.latency} ms</p>
                        <p>Bandwidth: {host_data.bandwidth} ms</p>

                    </div>
                </div>
                )}
            </div>
            
            
            {showHistory ? // if show history on
            (<ProxyHistoryPage setShowHistory = {setShowHistory} proxyHistory = {proxyHistory}/>
            ) :
            (   <div>
                {currentProxy ? //If you bought proxy then it shows
                (<PurchasedProxyPage proxyHistory = {proxyHistory} setShowHistory = {setShowHistory} currentProxy = {currentProxy} setcurrentProxy = {setcurrentProxy}/>
                ) : 
                (<AvailableProxyPage searchQuery = {searchQuery} handleSearchInput = {handleSearchInput} proxyHistory = {proxyHistory} 
                    setProxyHistory = {setProxyHistory} setShowHistory = {setShowHistory} filteredProxies = {filteredProxies} sealTokenBalance = {sealTokenBalance} 
                    setSealTokenBalance = {setSealTokenBalance} setcurrentProxy = {setcurrentProxy} setTransactions={setTransactions} />
                )}
                </div>
            )}
        </div>
    );
};

    // history button component
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

    // individual History item
    const ProxyHistoryItem = ({historyProxy}) => {
        return (
            <div className="proxy-item">
                <p>{historyProxy.proxy.host}</p>
                <p>{historyProxy.proxy.ip_addr}</p>
                <p>{historyProxy.proxy.location}</p>
                <p>{historyProxy.proxy.price} STK</p>
                <p>{historyProxy.proxy.bandwidth} Mbps</p>
                <p>Used On: {historyProxy.timestamp}</p>
            </div>
        );
    }

    // After purchasing a proxy this page shows
    const PurchasedProxyPage = ({setShowHistory, currentProxy, setcurrentProxy}) => {
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
                    <p>Bandwidth</p>
                </div>
                <div className='proxy-list'>
                    <div className="current-proxy-details">
                        <p>{currentProxy.host}</p>
                        <p>{currentProxy.ip_addr}</p>
                        <p>{currentProxy.location}</p>
                        <p>{currentProxy.price} STK</p>
                        <p>{currentProxy.bandwidth} Mbps</p>
                        <button className="disconnect-button" onClick={() => setcurrentProxy(null)}>
                            Disconnect
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    //didnt buy proxy shows list of proxies
    const AvailableProxyPage = ({searchQuery, handleSearchInput, setTransactions, setProxyHistory, setShowHistory, filteredProxies, sealTokenBalance, setSealTokenBalance, setcurrentProxy}) => {
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
                    <h1>Available HTTP Proxies</h1>
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
                    {filteredProxies.map((proxy) => ( // Map each proxy to a ProxyItem component pass in proxy obj
                        <ProxyItem key={proxy.id} proxy={proxy} sealTokenBalance ={sealTokenBalance}  setSealTokenBalance = {setSealTokenBalance}
                            setcurrentProxy = {setcurrentProxy} setProxyHistory = {setProxyHistory} setTransactions={setTransactions}
                        />
                    ))}
                </div>
            </div>
        );
    }


    //   Indiviual Proxy Card
    const ProxyItem = ({ proxy, sealTokenBalance, setSealTokenBalance, setcurrentProxy, setProxyHistory, setTransactions}) => {
    
        // Handle purchase logic
        const handlePurchase = (price) => {
        if (sealTokenBalance >= price) {
            alert(`Purchase successful! You spent ${price} SealTokens.`);
            setSealTokenBalance((prevBalance) => prevBalance - price); // Update balance
            setcurrentProxy(proxy);

            // Create a new proxy object with a timestamp
            const historyProxy = {
                proxy,
                timestamp: new Date().toLocaleString(), // Add a timestamp
            };
            setProxyHistory((prevHistory) => [...prevHistory, historyProxy]);

            //add new transaction
            setTransactions((prevTransactions) => [...prevTransactions, {
                id: prevTransactions.length + 1,
                type: 'Sent',
                date: new Date().toLocaleString(),
                to: proxy.host,
                sealTokens: proxy.price,
                reason: proxy.name,
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
            <p>{proxy.price} STK</p>
            <p>{proxy.bandwidth} Mbps</p>
        <div className="proxy-join">
          <button className="purchase-button" onClick={() => handlePurchase(proxy.price)}>
            Purchase
          </button>
        </div>
      </div>
    );
  };
  
  export default ProxyPage;
