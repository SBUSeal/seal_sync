import React, {useState} from 'react';

const StatusPage = () => {

    const [dataAmount, setDataAmount] = useState(0);
    const [peers, setPeers] = useState(0);
    return (
    <div className="content">
      <div className="header">
       <h1>Connected to SealShare</h1>
       <p className="status-info">
            Hosting {dataAmount} KiB of data - Discovered {peers} peers</p>
     </div>
        <div className="buttons">
          <button className="btn btn-advanced">Advanced</button>
        </div>
        {/* <div className="graph-placeholder">
          Graph goes here
        </div> */}
    </div>
        );
    };

export default StatusPage;