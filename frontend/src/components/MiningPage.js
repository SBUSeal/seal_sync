import React, { useState, useEffect } from 'react';
import '../stylesheets/MiningPage.css';

const MiningPage = ({ sealTokenBalance, setSealTokenBalance, miningLog, setMiningLog, isMining, setIsMining, fetchBalance}) => {
    const [hashRate, setHashRate] = useState(0); 
    const startMiningEndpoint = "http://localhost:8080/startMining";
    const stopMiningEndpoint = "http://localhost:8080/stopMining";


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
            updateLog("Mining started successfully.");
        }
        else{
            updateLog("Mining stopped successfully.");
        }
    };

    useEffect(() => {
        if (isMining) {
            startMining();
        } else {
            stopMining();
        }
    }, [isMining]);


    return (
        <div className="mining-container">
            <div className="dashboard">
                <div className="tile">
                    <h2>Balance: {sealTokenBalance.toFixed(2)} SKT</h2>
                    <h2>Hash Rate: {hashRate} blocks/sec</h2>
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
