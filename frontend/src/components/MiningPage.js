import React, { useState } from 'react';
import '../stylesheets/MiningPage.css'; 

const MiningPage = () => {
    const [devices, setDevices] = useState([
        { name: 'AMD Ryzen Threadripper PRO 7995WX', hashPower: '37.56 MH/s', powerUsage: '50W', status: 'Mining', profitability: '0.5523342/day' },
        { name: 'GeForce RTX 3090', hashPower: '37.56 MH/s', powerUsage: '100W', status: 'Mining', profitability: '0.2323/day' },
        { name: 'GeForce RTX 4090', hashPower: '37.56 MH/s', powerUsage: '200W', status: 'Mining', profitability: '0.8311008/day' },
        { name: 'NVIDIA RTX 6000 Ada Generation', hashPower: '37.56 MH/s', powerUsage: '300W', status: 'Mining', profitability: '0.66345/day' },
        { name: 'GeForce RTX 3090', hashPower: '37.56 MH/s', powerUsage: 'Disabled', status: 'Disabled', profitability: '0/day' }
    ]);
    const [balance, setBalance] = useState(100.00);
    const [hashPower, setHashPower] = useState(175.24);
    const [unpaidBalance, setUnpaidBalance] = useState(3.65);
    const [nextPayout, setNextPayout] = useState('3h 28m');

    return (
        <div className="mining-container">
            <div className="dashboard">
                <div className="balance">
                    <h2>Balance</h2>
                    <p>{balance} ORC</p>
                </div>
                <div className="hash-power">
                    <h2>Hash Power</h2>
                    <p>{hashPower} MH/s</p>
                </div>
                <div className="unpaid-balance">
                    <h2>Unpaid Balance</h2>
                    <p>{unpaidBalance} ORC</p>
                    <small>Next Payout: {nextPayout}</small>
                </div>
                <div className="devices-mining">
                    <h2>Devices Mining</h2>
                    <p>{devices.filter(device => device.status !== 'Disabled').length}/{devices.length}</p>
                </div>
            </div>
            <div className="device-list">
                {devices.map((device, index) => (
                    <div key={index} className="device">
                        <h3>{device.name}</h3>
                        <p>Hash Power: {device.hashPower}</p>
                        <p>Status: {device.status} {device.powerUsage}</p>
                        <p>Profitability: {device.profitability}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MiningPage;
