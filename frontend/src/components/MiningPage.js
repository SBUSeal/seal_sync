import React, { useState, useEffect } from 'react';
import '../stylesheets/MiningPage.css';

const MiningPage = ({sealTokenBalance, setSealTokenBalance, miningLog, setMiningLog}) => {
    const [isMining, setIsMining] = useState(false);
    const [hashPower, setHashPower] = useState(492.44);

    useEffect(() => {
        let interval;
        if (isMining) {
            interval = setInterval(() => {
                setSealTokenBalance(prevBalance => prevBalance + (hashPower * 0.0001));
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
        }

        return () => clearInterval(interval);
    }, [isMining, hashPower, miningLog, setSealTokenBalance, setMiningLog]);

    const handleToggle = () => {
        setIsMining(!isMining);
    };

    return (
        <div className="mining-container">
            <div className="dashboard">
                <div className="tile">
                    <h2>Balance: {sealTokenBalance.toFixed(2)} SKT</h2>
                    <h2>Hash Power: {hashPower} MH/s</h2>
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
                        <li key={index}>{entry.type === 'start' ? 'Started' : 'Stopped'} Mining at {entry.timestamp}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default MiningPage;
