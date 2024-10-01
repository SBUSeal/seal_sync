import React from 'react';


function Sidebar() {
  return (
    <div className="sidebar">
      <div className="logo">
        <h2>Seal Share</h2>
      </div>
      <ul>
      /* creating buttons for navigation bar */
        <li>Status</li>
        <li>Files</li>
        <li>Wallet</li>
        <li>Peers</li>
        <li>Settings</li>
      </ul>
    </div>
  );
}

export default Sidebar;