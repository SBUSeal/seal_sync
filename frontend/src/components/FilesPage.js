import React, { useState } from 'react';
import { DotsVerticalIcon, PlusCircledIcon, LayersIcon, FileIcon, DownloadIcon, Share2Icon, UploadIcon } from '@radix-ui/react-icons';
import '../stylesheets/FilesPage.css';

const FilesPage = () => {
  const [files, setFiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState(null); 
  const [tempFiles, setTempFiles] = useState([]);
  const [newFileDetails, setNewFileDetails] = useState({ price: '', description: '' });
  const [searchQuery, setSearchQuery] = useState(''); 
  const [filteredFiles, setFilteredFiles] = useState(files); 

  function handleFileUpload(event) {
    const selectedFiles = Array.from(event.target.files);
    setTempFiles(selectedFiles); 
    setIsModalOpen(true); 
  }

  function handleDownload(file) {
   
  }

  function handleModalSubmit() {
    const newFiles = tempFiles.map(file => ({
      name: file.name,
      size: file.size,
      status: 'unlocked',
      source: 'local',
      price: newFileDetails.price,
      description: newFileDetails.description,
      isFolder: false, 
    }));

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    setFilteredFiles(updatedFiles); 

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
      const updatedFiles = [...files, { name: folderName, size: 0, status: 'unlocked', source: 'local', isFolder: true }];
      setFiles(updatedFiles);
      setFilteredFiles(updatedFiles); 
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


  // Handle search query input
  function handleSearchInput(e) {
    setSearchQuery(e.target.value);
  }
  // Handle search on enter key press
  function handleSearchKeyPress(e) {
    if (e.key === 'Enter') {
      const filtered = files.filter(file => file.name.toLowerCase().includes(searchQuery.toLowerCase()));
      setFilteredFiles(filtered); // Set the filtered files to display
    }
  }

  return (
    <div className="file-manager-container">
      <div className="top-bar">
        <input
          type="text"
          className="search-bar"
          placeholder="Search"
          value={searchQuery}
          onChange={handleSearchInput}
          onKeyPress={handleSearchKeyPress} // Handle Enter key press
        />
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
          {filteredFiles.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan="5" className="no-files-message">No files match your search</td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {filteredFiles.map((file, index) => (
                <tr key={index}>
                  <td>
                    {file.isFolder ? <LayersIcon /> : <FileIcon />} {file.name}
                  </td>
                  <td>{file.isFolder ? 'Folder' : 'File'}</td>
                  <td>{formatFileSize(file.size)}</td>
                  <td>{new Date().toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleDownload(file)}>
                      <DownloadIcon />
                    </button>

                    <button>
                      <Share2Icon />
                    </button>
                    <button onClick={() => file.isFolder ? 'OPENFOLDER' : openFileDetails(file)}>
                      <DotsVerticalIcon />
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
              type='number'
              value={newFileDetails.price}
              onChange={(e) => setNewFileDetails({ ...newFileDetails, price: e.target.value })}
            />
            SealTokens

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
