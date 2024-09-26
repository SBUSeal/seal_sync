import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">
          <h2>Seal Share</h2>
        </div>
        <ul>
          <li><button>Status</button></li>
          <li><button>Files</button></li>
          <li><button>Wallet</button></li>
          <li><button>Peers</button></li>
          <li><button>Settings</button></li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="content">
        {/* Topbar */}
        <div className="topbar">
          <input type="text" placeholder="Search..." className="search-input" />
        </div>

        {/* Main Area */}
        <div className="main-content">
          <h1>Connected to Seal Share</h1>
          
        </div>
      </div>
    </div>
  );
}

export default App;