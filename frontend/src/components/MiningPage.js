import React, { useState, useEffect } from 'react';
import '../stylesheets/MiningPage.css';

/*const MiningPage = ({sealTokenBalance, setSealTokenBalance, miningLog, setMiningLog, notifStatus}) => {
    const [isMining, setIsMining] = useState(false);
    const [hashPower, setHashPower] = useState(492.44);
    const [cpuUsage, setCpuUsage] = useState(0);
    const [gpuUsage, setGpuUsage] = useState(0);
    const [notification, setNotification] = useState({ message: '', type: '' });

    useEffect(() => {
        let interval;
        if (isMining) {
            interval = setInterval(() => {
                setSealTokenBalance(prevBalance => prevBalance + (hashPower * 0.0001));

                setCpuUsage((Math.random() * 40 + 20).toFixed(2))//20% to 60%
                setGpuUsage((Math.random() *30 + 10).toFixed(2));//10% to 40%
                if (miningLog.length === 0 || miningLog[0].type === 'stop') {
                    const startEntry = {
                        type: 'start',
                        timestamp: new Date().toLocaleString()
                    };
                    setMiningLog(prevLog => [startEntry, ...prevLog]);
                }
            }, 1000);
        } else {
            clearInterval(interval);
            if (miningLog.length !== 0 && miningLog[0].type === 'start') {
                const stopEntry = {
                    type: 'stop',
                    timestamp: new Date().toLocaleString()
                };
                setMiningLog(prevLog => [stopEntry, ...prevLog]);
            }
        }*/
       
const MiningPage = ({ sealTokenBalance, setSealTokenBalance, miningLog, setMiningLog, isMining, setIsMining, fetchBalance, notifStatus}) => {
    const [tokenRate, setTokenRate] = useState(0.3); 
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

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification({ message: '', type: '' });
        }, 3000);
    };

    useEffect(() => {
        if (isMining) {
            startMining();
            if(notifStatus === 'All' || notifStatus == 'Urgent'){
            showNotification('Mining Started: Using resources');
        }
        } else {
            stopMining();
            if(notifStatus === 'All' || notifStatus == 'Urgent'){
                showNotification('Mining Stopped');
            }
        }
    }, [isMining]);


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
