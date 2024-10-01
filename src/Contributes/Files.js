import React from 'react';


const Files = () => {
  return (
    <div>
      {/* Buttons for actions */}
      <div className="buttons">
        <button className="btn btn-network">Upload to Network</button>
        <button className="btn btn-local">Upload Local</button>
      </div>

      {/* File Table */}
      <table className="file-table">
        <thead>
          <tr>
            <th>File Name</th>
            <th>Size</th>
            <th>Date Uploaded</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>example.txt</td>
            <td>2 MB</td>
            <td>2024-09-30</td>
            <td><button>Download</button> <button>Delete</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Files;