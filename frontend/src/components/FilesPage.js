import React, { useState } from 'react';
import { DotsVerticalIcon, PlusCircledIcon, LayersIcon, FileIcon, DownloadIcon, Share1Icon, UploadIcon } from '@radix-ui/react-icons';
import '../stylesheets/FilesPage.css';

const FilesPage = () => {
  const [files, setFiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); //uploading file
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState(null); 
  const [tempFiles, setTempFiles] = useState([]);
  const [newFileDetails, setNewFileDetails] = useState({ price: '', description: '' });
  const [searchQuery, setSearchQuery] = useState(''); 
  const [filteredFiles, setFilteredFiles] = useState(files); 
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false)
  const [cid, setCid] = useState('');


  function handleFileUpload(event) {
    const selectedFiles = Array.from(event.target.files);
    setTempFiles(selectedFiles); 
    setIsModalOpen(true); 
  }

  function handleDownload(file) {

  }

  function handleDownloadFile() {
    setIsDownloadModalOpen(true)
  }

  function handleCidChange(e) {
    setCid(e.target.value);

  }

  function closeDownloadModal() {
    setCid("")
    setIsDownloadModalOpen(false)
  }

  // Creates a dummy file after we press download
  function dummyDownload() {
    const dummyFile = {
      name: `Dummy File ${files.length }`, 
      size: 420,
      status: 'unlocked',
      source: 'local',
      price: '42', 
      description: 'Dummy description', 
      isFolder: false,
    };

    const updatedFiles = [...files, dummyFile];
    setFiles(updatedFiles);
    setFilteredFiles(updatedFiles);
    
    closeDownloadModal()
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
    const query = e.target.value;
    setSearchQuery(query);

    const filtered = files.filter(file =>
      file.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredFiles(filtered);
  }
  // Handle search on enter key press
  // function handleSearchKeyPress(e) {
  //   if (e.key === 'Enter') {
  //     const filtered = files.filter(file => file.name.toLowerCase().includes(searchQuery.toLowerCase()));
  //     setFilteredFiles(filtered); // Set the filtered files to display
  //   }
  // }

  return (
    <div className="file-manager-container">
      <div className="top-bar">
        <input
          type="text"
          className="search-bar"
          placeholder="Search"
          value={searchQuery}
          onChange={handleSearchInput}
          // onKeyPress={handle} // Handle Enter key press
        />
        <div className="action-buttons">
          <button onClick={handleDownloadFile} className="action-btn">
            <DownloadIcon /> <div className='action-btn-text'> Download </div>
          </button>
          <button className="action-btn">
            <UploadIcon /> 
            <div className='action-btn-text'>Upload</div>
            <input type="file" multiple onChange={handleFileUpload} />
          </button>
        </div>
      </div>

      <>Filter</>

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
                      <Share1Icon />
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
              min={0}
              value={newFileDetails.price}
              onChange={(e) => setNewFileDetails({ ...newFileDetails, price: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === 'e') {
                  e.preventDefault();  // Prevent typing "-" or "e"
                }
              }}
            />
            SealTokens

            <textarea
              value={newFileDetails.description}
              onChange={(e) => setNewFileDetails({ ...newFileDetails, description: e.target.value })}
              placeholder="Enter description"
            ></textarea>
            <div className="modal-actions">
              <button onClick={handleModalClose}>Cancel</button>
              <button onClick={handleModalSubmit} disabled={newFileDetails.price.trim() === '' || newFileDetails.description.trim() === ''}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {isFileModalOpen && currentFile && (
        <div className="modal">
          <div className="modal-content"  style={{textAlign: "left"}}>
            <h2>File Details</h2>
            <p><strong>Name:</strong> {currentFile.name}</p>
            <p><strong>Size:</strong> {formatFileSize(currentFile.size)}</p>
            <p><strong>Price:</strong> {currentFile.price + " Seal Token"}</p>
            <p><strong>Description:</strong> {currentFile.description}</p>
            <div className="modal-actions" style={{marginTop: "30px"}}>
              <button onClick={closeFileModal}>Close</button>
            </div>
          </div>
        </div>
      )}


      {isDownloadModalOpen && (
              <div className="modal">
                <div className="modal-content" style={{maxWidth: "600px"}}>
                  <label style={{fontSize: "20px", display: 'block'}} htmlFor="cidInput"> <h2> Enter File CID </h2></label>
                  <input
                    className='cid-input'
                    type="text"
                    id="cidInput"
                    value={cid}
                    onChange={handleCidChange}
                    placeholder="File CID"
                    required
                  />

                  <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: "50px",
                      alignItems: 'center',
                      marginTop: "150px"
                    }}>
                    <div className='modal-actions'>
                      <button onClick={closeDownloadModal} style={{fontSize: '20px'}}>Close</button>
                    </div>
                    <div className='modal-actions'>
                      <button onClick={dummyDownload} style={{fontSize: '20px'}} disabled={cid.trim() === ''}>Download</button>
                    </div>
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