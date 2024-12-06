import React, { useState, useEffect } from 'react';
import '../stylesheets/MiningPage.css';

const MiningPage = ({sealTokenBalance, setSealTokenBalance, miningLog, setMiningLog, notifStatus}) => {
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
        }

        return () => clearInterval(interval);
    }, [isMining, hashPower, miningLog, setSealTokenBalance, setMiningLog]);

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
                    <h2>Hash Power: {hashPower} MH/s</h2>
                    <h2>CPU Usage: {cpuUsage}%</h2>
                    <h2>GPU Usage: {gpuUsage}%</h2> 
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
                        <li key={index}>{entry.type === 'start' ? 'Started' : 'Stopped'} Mining at {entry.timestamp}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default MiningPage;
