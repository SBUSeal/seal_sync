import React, { useState } from 'react';
import '@radix-ui/themes/styles.css';
import { DotsVerticalIcon, PlusCircledIcon, LayersIcon, FileIcon, DownloadIcon, Share2Icon, UploadIcon } from '@radix-ui/react-icons';
import '../stylesheets/FilesPage.css';


const FilesPage = () => {
  const [files, setFiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false); // File details modal
  const [currentFile, setCurrentFile] = useState(null); // Store the file details
  const [tempFiles, setTempFiles] = useState([]); // Temporary storage for uploaded files before modal confirmation
  const [newFileDetails, setNewFileDetails] = useState({ price: '', description: '' });

  function handleFileUpload(event) {
    const selectedFiles = Array.from(event.target.files);
    setTempFiles(selectedFiles); 
    setIsModalOpen(true); 
  }

  function handleModalSubmit() {
    const newFiles = tempFiles.map(file => ({
      name: file.name,
      size: file.size,
      status: 'unlocked',
      source: 'local',
      price: newFileDetails.price,
      description: newFileDetails.description,
      isFolder: false, // Indicate it's a file
    }));

    setFiles(prevFiles => [...prevFiles, ...newFiles]);

    setTempFiles([]); 
    setNewFileDetails({ price: '', description: '' }); 
    setIsModalOpen(false);
  }

  function handleModalClose() {
    setTempFiles([]); 
    setIsModalOpen(false); 
  }

  function createFolder() {
    const folderName = prompt('Enter Folder Name');
    if (folderName) {
      setFiles(prevFiles => [...prevFiles, { name: folderName, size: 0, status: 'unlocked', source: 'local', isFolder: true }]);
    }
  }

  

  // Handle file click to open file details modal
  function openFileDetails(file) {
    setCurrentFile(file); // Set the clicked file details
    setIsFileModalOpen(true); // Open the file details modal
  }

  // Close file modal
  function closeFileModal() {
    setIsFileModalOpen(false); // Close the file details modal
  }

  return (
    <div className="file-manager-container">
      <div className="top-bar">
        <input type="text" className="search-bar" placeholder="Search" />
        <div className="action-buttons">
          <button onClick={createFolder} className="action-btn">
            <PlusCircledIcon /> <div className='action-btn-text'>Create Folder</div>
          </button>
          <button className="action-btn">
            <UploadIcon /> 
            <div className='action-btn-text'>Upload</div>
            <input type="file" multiple onChange={handleFileUpload} />
          </button>
        </div>
      </div>

      <div className="file-section">
        <table className="file-table">
          <thead>
            <tr>
              <th>name</th>
              <th>type</th>
              <th>size</th>
              <th>date added</th>
              <th></th>
            </tr>
          </thead>
          {files.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan="5" className="no-files-message">No files uploaded</td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {files.map((file, index) => (
                <tr key={index}>
                  <td>
                    {file.isFolder ? <LayersIcon /> : <FileIcon />} {file.name}
                  </td>
                  <td>{file.isFolder ? 'Folder' : 'File'}</td>
                  <td>{formatFileSize(file.size)}</td>
                  <td>{new Date().toLocaleDateString()}</td>
                  <td>
                    <button>
                      <DownloadIcon />
                    </button>
                    <button>
                      <Share2Icon />
                    </button>
                    <button onClick={() => file.isFolder ? 'OPENFOLDER' : openFileDetails(file)}>
                      <DotsVerticalIcon/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {/* Modal for additional file details */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Enter File Details</h2>
            <label>Price:</label>
            <input
              type="number"
              value={newFileDetails.price}
              onChange={(e) => setNewFileDetails({ ...newFileDetails, price: e.target.value })}
              placeholder="Enter price"
            />
            <label>Description:</label>
            <textarea
              value={newFileDetails.description}
              onChange={(e) => setNewFileDetails({ ...newFileDetails, description: e.target.value })}
              placeholder="Enter description"
            ></textarea>
            <div className="modal-actions">
              <button onClick={handleModalClose}>Cancel</button>
              <button onClick={handleModalSubmit}>Submit</button>
            </div>
          </div>
        </div>
      )}


      {isFileModalOpen && currentFile && (
        <div className="modal">
          <div className="modal-content">
            <h2>File Details</h2>
            <p><strong>Name:</strong> {currentFile.name}</p>
            <p><strong>Size:</strong> {formatFileSize(currentFile.size)}</p>
            <p><strong>Price:</strong> {currentFile.price}</p>
            <p><strong>Description:</strong> {currentFile.description}</p>
            <div className="modal-actions">
              <button onClick={closeFileModal}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

function formatFileSize(size) {
  if (size === 0) return 'Folder';
  const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
}

export default FilesPage;
