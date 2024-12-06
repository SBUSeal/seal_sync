import React, { useState, useEffect } from 'react';
import '../stylesheets/StatusPage.css'; // Ensure the CSS is updated for the new look
import worldMap from '../images/Worldmap.png';



const StatusPage = ({ downloadsInProgress = [] }) => { 
  const [dataAmount, setDataAmount] = useState(100); // Example data amount
  const [peers, setPeers] = useState(5); // Example peers
  const [incomingData, setIncomingData] = useState(1.2); // Incoming traffic
  const [outgoingData, setOutgoingData] = useState(0.8); // Outgoing traffic
  const [uploadedFiles, setUploadedFiles] = useState(0); // Files uploaded
  const [downloadedFiles, setDownloadedFiles] = useState(0); // Files downloaded
  const [peerLocations, setPeerLocations] = useState([
    { city: 'New York', coords: { top: '40%', left: '30%' } },
    { city: 'London', coords: { top: '35%', left: '50%' } },
    { city: 'Tokyo', coords: { top: '45%', left: '80%' } }
  ]);

  // For changing incoming/outgoing data
  useEffect(() => {
    const interval = setInterval(() => {
      setIncomingData((Math.random() * 2).toFixed(2));
      setOutgoingData((Math.random() * 1.5).toFixed(2));
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  //Using localStorage for updating counts
  useEffect(() => {
    const uploadCount = localStorage.getItem('uploadedFilesCount') || 0;
    const downloadCount = localStorage.getItem('downloadedFilesCount') || 0;

    setUploadedFiles(parseInt(uploadCount));
    setDownloadedFiles(parseInt(downloadCount));
  }, []);

  return (
    <div className="dashboard-content">
      <div className="header">
        <h1>SealShare Dashboard</h1>
        <p className="status-info">
          Hosting {dataAmount} KiB of data - Connected to {peers} peers
        </p>
      </div>

      <div className="dashboard-grid">
        
        {/* Network Traffic Section with Progress Bars */}
        <div className="network-traffic card">
          <h3>Network Traffic</h3>
          <div className="traffic-item">
            <p><strong>Incoming:</strong> {incomingData} KiB/s</p>
            <div className="bar">
              <div
                className="bar-fill"
                style={{ width: `${(incomingData / 2) * 100}%`, backgroundColor: '#36a2eb' }}
              ></div>
            </div>
          </div>
          <div className="traffic-item">
            <p><strong>Outgoing:</strong> {outgoingData} KiB/s</p>
            <div className="bar">
              <div
                className="bar-fill"
                style={{ width: `${(outgoingData / 1.5) * 100}%`, backgroundColor: '#ff6384' }}
              ></div>
            </div>
          </div>
        </div>

        {/* Uploaded vs Downloaded Files Section */}
        <div className="file-stats card">
          <h3>File Transfer Stats</h3>
          <div className="file-counter">
            <div className="stat-card">
              <h4>Uploaded Files</h4>
              <div className="counter">
              <span >{uploadedFiles}</span>
              </div>
            </div>
            <div className="stat-card">
              <h4>Downloaded Files</h4>
              <div className="counter">
                <span>{downloadedFiles}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Downloads In Progress Section */}
        <div className="downloads-progress card">
          <h3>Downloads In Progress</h3>
          
          {downloadsInProgress && downloadsInProgress.length === 0 ? (

            <p>No downloads in progress.</p>
          ) : (
            downloadsInProgress.map((file, index) => (
              <div key={index} className="download-item">
                <p><strong>{file.name}</strong> - {file.size}</p>
                <p>Downloading...</p>
              </div>
            ))
          )}
        </div>

        {/* Bandwidth Over Time Section */}
        <div className="bandwidth-section card">
          <h3>Bandwidth Over Time</h3>
          <p>[Graph placeholder - future enhancement]</p>
        </div>

        

        {/* Peer Information with Static Map */}
        <div className="peer-info card">
          <h3>Peers on the Network</h3>
          <div className="map-container">
            <img src={worldMap} alt="World Map" className="world-map" />
            {peerLocations.map((peer, index) => (
              <div key={index} className="peer-marker" style={{ top: peer.coords.top, left: peer.coords.left }}>
                <span className="tooltip">{peer.city}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusPage;