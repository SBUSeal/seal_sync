import React, { useState } from 'react';
import '../stylesheets/ProxyPage.css';

/* States */
const ProxyPage = ({ sealTokenBalance, setSealTokenBalance, currentProxy, setcurrentProxy }) => { // Destruct Properties
    const proxies = [   /* Dummy Data */
        {
            id: 1,
            ip_addr: '41.77.0.1',
            host: '1B3qRz5g4dEF4DMPGT1L3TThzv6CvzNB',
            price: 5,
            users: 2
        },
        {
            id: 2,
            ip_addr: '8.8.8.8',
            host: '1A72tpP5QGeiF2DMPfTT1S5LLmv7DivFNa',
            price: 200,
            users: 20
        },
        {
            id: 3,
            ip_addr: '95.165.0.1',
            host: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
            price: 30,
            users: 3
        },
        {
            id: 4,
            ip_addr: '58.14.0.1',
            host: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kygt080',
            price: 45,
            users: 5
          },
    ];

    const [isOn, setIsOn] = useState(() => JSON.parse(localStorage.getItem('proxy')) || false); /* Proxy Toggle State */
    const [price, setPrice] = useState(() => JSON.parse(localStorage.getItem('price')) || '');  /* State of Proxy Price */
    const [isEditing, setIsEditing] = useState(price === '');   /* State of proxy price input */
    const [searchQuery, setSearchQuery] = useState('');  /* State of the search query */
    const [filteredProxies, setFilteredProxies] = useState(proxies);  /*State of filtered proxies*/
    const [proxyHistory, setProxyHistory] = useState([]); // State to store proxy history
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
        if (price === '') {
            alert('Proxy Price Can Not Be Empty')
        } else {
            const newIsOn = !isOn;
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
          setIsEditing(false);  /* after enter, save and set input into css save mode */
        } 
        else {  /* submitting empty field */
            if (isOn) { /* cant submit empty field when prxy is already one */
                setPrice(JSON.parse(localStorage.getItem('price')));
                setIsEditing(false);
            } else {    /* clearing price field */
                localStorage.setItem('price', JSON.stringify(''));
                setIsEditing(true);  /* after enter, save and set input into css save mode */
            }
        }
     };
    
    /* form on click = editing, changes css */
    const editPrice = () => {
        setIsEditing(true);
    };

    // Handle search query input
    function handleSearchInput(e) {
        const query = e.target.value;
        setSearchQuery(query);

        const filtered = proxies.filter(proxy =>
        proxy.host.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredProxies(filtered);
    }
  
    return (
        <div className="container">
            {/* Self Proxy Section */}
            <div className="proxy-head">
                <div>
                    <h1>Proxy Status</h1>
                    <button className={`toggle-button ${isOn ? 'on' : 'off'}`} onClick={handleToggle}>
                        {isOn ? 'On' : 'Off'}
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
                            readOnly={!isEditing}
                            className={`price-input ${isEditing ? 'editing' : 'saved'}`}
                            onClick={editPrice}
                        />
                    </form>
                </div>
            </div>
            {isOn && (  // If proxy on share metrics about the proxy
                <div className="proxy-active">
                    <div>
                        <h2>Active Proxy Details</h2>
                        <p>IP: {host_data.ip_addr}</p>
                        <p>Connected Users: {host_data.users}</p>
                        <p>Data Transferred: {host_data.dataTransferred} MB</p>
                        <p>Latency: {host_data.latency} ms</p>
                    </div>
                    <div>
                        <button className = 'disconnect-button' onClick={() => setIsOn(false)}>Turn Off Proxy</button>
                    </div>
                </div>
            )}
            {showHistory ? // if show history on
            (   <div>
                    {proxyHistory.map((historyProxy) => ( // Map each history proxy to a HistoryProxyItem component pass in proxy obj
                                <ProxyHistoryItem key={historyProxy.proxy.id} historyProxy={historyProxy}/>
                    ))}
                    <button className="history-button" onClick={() => setShowHistory(false)}>
                        Back
                    </button>
                </div>
            ) :
            (   <div>
                {currentProxy ? //If you bought proxy then it shows
                (<PurchasedProxyPage proxyHistory = {proxyHistory} setShowHistory = {setShowHistory} currentProxy = {currentProxy} setcurrentProxy = {setcurrentProxy}/>
                ) : 
                (<AvailableProxyPage searchQuery = {searchQuery} handleSearchInput = {handleSearchInput} proxyHistory = {proxyHistory} 
                    setProxyHistory = {setProxyHistory} setShowHistory = {setShowHistory} filteredProxies = {filteredProxies} sealTokenBalance = {sealTokenBalance} 
                    setSealTokenBalance = {setSealTokenBalance} setcurrentProxy = {setcurrentProxy} />
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

    // individual History item
    const ProxyHistoryItem = ({historyProxy}) => {
        return (
            <div className="proxy-item">
                <div className="proxy-details">
                    <p>{historyProxy.proxy.ip_addr}</p>
                    <p>Host: {historyProxy.proxy.host}</p>
                    <p>Price: {historyProxy.proxy.price}</p>
                </div>
                <div className="proxy-details">
                    <p>{historyProxy.timestamp}</p>
                </div>
            </div>  
        );
    }

    // After purchasing a proxy this page shows
    const PurchasedProxyPage = ({proxyHistory, setShowHistory, currentProxy, setcurrentProxy}) => {
        return (
            <div id="current-proxy-container">
                <div className="available-proxy-container">
                    <h1 style={{ textAlign: 'center', fontSize: '30px' }}>Current Proxy</h1>
                    {/* If there is previous proxy history, show the button */}
                    {proxyHistory.length !== 0 && (
                        <HistoryButton setShowHistory={setShowHistory} />
                    )} 
                </div>
                <div className='current-proxy-details'>
                    <p>IP Address: {currentProxy.ip_addr}</p>
                    <p>Host: {currentProxy.host}</p>
                    <p>Price: {currentProxy.price} SealToken{currentProxy.price > 1 ? 's' : ''}</p>
                    <button className="disconnect-button" onClick={() => setcurrentProxy(null)}>Disconnect From Proxy</button>
                </div>
            </div>
        );
    }

    //didnt buy proxy shows list of proxies
    const AvailableProxyPage = ({searchQuery, handleSearchInput, proxyHistory, setProxyHistory, setShowHistory, filteredProxies, sealTokenBalance, setSealTokenBalance, setcurrentProxy}) => {
        return (
            <div> 
                <div className="available-proxy-container">
                    <input
                        type="text"
                        className="proxy-search-bar"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={handleSearchInput}
                    />
                    <h1>Available HTTP Proxies</h1>
                    {/* If there is previous proxy history, show the button */}
                    {proxyHistory.length !== 0 && (
                        <HistoryButton setShowHistory={setShowHistory} />
                    )} 
                </div>
                <div className='proxy-list'>
                    {filteredProxies.map((proxy) => ( // Map each proxy to a ProxyItem component pass in proxy obj
                        <ProxyItem key={proxy.id} proxy={proxy} sealTokenBalance ={sealTokenBalance}  setSealTokenBalance = {setSealTokenBalance}
                            setcurrentProxy = {setcurrentProxy} setProxyHistory = {setProxyHistory}
                        />
                    ))}
                </div>
            </div>
        );
    }


    //   Indiviual Proxy Card
    const ProxyItem = ({ proxy, sealTokenBalance, setSealTokenBalance, setcurrentProxy, setProxyHistory}) => {
        const [isHovered, setIsHovered] = useState(false);
    
        // Handle hover state
        const handleMouseEnter = () => setIsHovered(true);
        const handleMouseLeave = () => setIsHovered(false);
    
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

        } else {
            alert('Insufficient balance.');
        }
    };
  
    return (
      <div className="proxy-item">
        <div className="proxy-details">
          <p>{proxy.ip_addr}</p>
          <p>Host: {proxy.host}</p>
        </div>
        <div className="proxy-join">
          <button
            className="purchase-button"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => handlePurchase(proxy.price)} // No need to pass state here
          >
            {isHovered ? 'Purchase' : `${proxy.price} SealToken${proxy.price > 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    );
  };
  
  export default ProxyPage;
