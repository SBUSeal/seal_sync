import React, { useState, useEffect } from 'react';
import '../stylesheets/MiningPage.css';

const MiningPage = ({ sealTokenBalance, setSealTokenBalance, miningLog, setMiningLog, isMining, setIsMining, fetchBalance}) => {
    const [tokenRate, setTokenRate] = useState(0); 
    const [prevBalance, setPreviousBalance] = useState(0);
    const startMiningEndpoint = "http://localhost:8080/startMining";
    const stopMiningEndpoint = "http://localhost:8080/stopMining";
    const [notification, setNotification] = useState({ message: '', type: '' });


    const updateLog = (message) => {
        const entry = {
            message,
            timestamp: new Date().toLocaleString(),
        };
        setMiningLog((prevLog) => [entry, ...prevLog]);
    };


    const startMining = () => {
            fetch(startMiningEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Failed to start mining: ${response.statusText}`);
                    }
                    return response.json();
                })
                .catch((error) => {
                    updateLog(`Error: ${error.message}`);
                });
    };

     const stopMining = () => {
            fetch(stopMiningEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Failed to stop mining: ${response.statusText}`);
                    }
                    return response.json();
                })
                .catch((error) => {
                    updateLog(`Error: ${error.message}`);
                });
    };


  
 
   useEffect(() => {
        fetchBalance(); 
        const balanceInterval = setInterval(fetchBalance, 5000);
        return () => clearInterval(balanceInterval); 
    }, []);

    const handleToggle = () => {
        setIsMining((prevState) => !prevState);
        if (isMining){
            updateLog("Mining stopped successfully.");
        }
        else{
            updateLog("Mining started successfully.");
        }
    };

    useEffect(() => {
        if (isMining) {
            startMining();
        } else {
            stopMining();
        }
    }, [isMining]);

    const handleToggle = () => {
        setIsMining(!isMining);
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification({ message: '', type: '' });
        }, 3000);
    };

    const testAllNotifications = () => {
        console.log('testAllNotifs called with notifStatus'+notifStatus);
        if (notifStatus === 'All') {
            showNotification('This is a test for "All notifications" setting.', 'success');
        }
    };

    const testUrgentNotifications = () => {
        console.log('testUrgentNotifs called with notifStatus'+notifStatus);
        if (notifStatus === 'All' || notifStatus === 'Urgent') {
            showNotification('This is a test for "Urgent notifications" setting.', 'success');
        }
    };

    return (
        <div className="mining-container">
            {/* Notification */}
            {notification.message && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}
            <div className="dashboard">
                <div className="tile">
                    <h2>Balance: {sealTokenBalance.toFixed(2)} SKT</h2>
                    <h2>Hash Rate: {tokenRate} blocks/sec</h2>
                </div>
                <div className="mining-control">
                    <label className="switch">
                        <input type="checkbox" checked={isMining} onChange={handleToggle} />
                        <span className="slider round"></span>
                    </label>
                    <span className="mining-status">
                        {isMining ? 'Stop Mining' : 'Start Mining'}
                    </span>
                </div>
            </div>
            <div className="test-buttons">
                <button onClick={testAllNotifications}>Test "All Notifications"</button>
                <button onClick={testUrgentNotifications}>Test "Urgent Notifications"</button>
            </div>
            <div className="mining-log">
                <h3>Mining Activity Log:</h3>
                <ul>
                    {miningLog.map((entry, index) => (
                        <li key={index}>
                            {entry.message} at {entry.timestamp}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default MiningPage;
