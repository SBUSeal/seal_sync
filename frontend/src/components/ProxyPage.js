import React, { useState } from 'react';
import '../stylesheets/ProxyPage.css';

/* States */
const ProxyPage = ({ sealTokenBalance, setSealTokenBalance }) => { // Destruct Properties
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
  
    return (
      <div className="container">
        {/* Self Proxy Section */}
        <div className="proxy-head">
            <div>
                <h1>Proxy Status</h1>
                <button
                    className={`toggle-button ${isOn ? 'on' : 'off'}`}
                    onClick={handleToggle}
                >
                {isOn ? 'On' : 'Off'}
                </button>
            </div>
            <div>
                <h1>Set Price</h1>
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
        {/* list of available proxies */}
        <h1 style={{ textAlign: 'center', fontSize: '30px' }}>Available Proxies</h1>

        <div className='proxy-list'>
            {proxies.map((proxy) => ( // Map each proxy to a ProxyItem component pass in proxy obj
                <ProxyItem key={proxy.id} proxy={proxy} sealTokenBalance ={sealTokenBalance}  setSealTokenBalance = {setSealTokenBalance}/>
            ))}
        </div>
      </div>
    );
  };

    //   Indiviual Proxy Card
  const ProxyItem = ({ proxy, sealTokenBalance, setSealTokenBalance }) => {
    const [isHovered, setIsHovered] = useState(false);
  
    // Handle hover state
    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);
  
    // Handle purchase logic
    const handlePurchase = (price) => {
      if (sealTokenBalance >= price) {
        alert(`Purchase successful! You spent ${price} SealTokens.`);
        setSealTokenBalance((prevBalance) => prevBalance - price); // Update balance
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
            {isHovered ? 'Purchase' : `${proxy.price} SealToken`}
          </button>
        </div>
      </div>
    );
  };
  
  export default ProxyPage;
