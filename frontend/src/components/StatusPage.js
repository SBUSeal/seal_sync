import React, { useState, useEffect } from 'react';
import '../stylesheets/StatusPage.css';

const StatusPage = () => {
  const [dataAmount, setDataAmount] = useState(100); // Example data amount
  const [peers, setPeers] = useState(5); // Example peers
  const [incomingData, setIncomingData] = useState(1.2); // Incoming traffic
  const [outgoingData, setOutgoingData] = useState(0.8); // Outgoing traffic
  const [filesSent, setFilesSent] = useState(30); // Files sent
  const [filesReceived, setFilesReceived] = useState(25); // Files received

  useEffect(() => {
    const interval = setInterval(() => {
      setIncomingData((Math.random() * 2).toFixed(2)); // Simulate incoming data
      setOutgoingData((Math.random() * 1.5).toFixed(2)); // Simulate outgoing data
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-content">
      <div className="header">
        <h1>Connected to SealShare</h1>
        <p className="status-info">
          Hosting {dataAmount} KiB of data - Discovered {peers} peers
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Network Traffic Section */}
        <div className="network-traffic">
          <h3>Network Traffic</h3>
          <div className="traffic-bars">
            <div className="traffic-bar incoming">
              <p>Incoming: {incomingData} KiB/s</p>
              <div className="bar">
                <div className="bar-fill" style={{ width: `${(incomingData / 2) * 100}%` }}></div>
              </div>
            </div>
            <div className="traffic-bar outgoing">
              <p>Outgoing: {outgoingData} KiB/s</p>
              <div className="bar">
                <div className="bar-fill" style={{ width: `${(outgoingData / 1.5) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Files Sent vs. Received Section */}
        <div className="file-data">
          <h3>Files Sent vs. Received</h3>
          <div className="files-chart">
            <p>Sent: {filesSent} files</p>
            <p>Received: {filesReceived} files</p>
          </div>
        </div>

        {/* Bandwidth Over Time Section */}
        <div className="bandwidth-section">
          <h3>Bandwidth Over Time</h3>
          <div className="bandwidth-chart">
            {/* Here you can integrate a library like Chart.js or Recharts for line chart */}
            <p>[Graph Placeholder]</p>
          </div>
        </div>

        {/* Traffic Counters */}
        <div className="traffic-counters">
          <h3>Traffic Counters</h3>
          <div className="counter">
            <p>Data Processed: 1.5 MiB</p>
            <p>Packets: 10,500</p>
          </div>
        </div>

        {/* Peer Information Section */}
        <div className="peer-info">
          <h3>Peer Information</h3>
          <div className="peer-details">
            <p>Active Peers: {peers}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusPage;