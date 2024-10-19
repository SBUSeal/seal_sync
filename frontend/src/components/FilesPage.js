import React, { useState } from 'react';
import { DotsVerticalIcon, PlusCircledIcon, LayersIcon, FileIcon, DownloadIcon, Share1Icon, UploadIcon } from '@radix-ui/react-icons';
import '../stylesheets/FilesPage.css';
import FileViewer from './FileViewer';  


const FilesPage = () => {
  const [files, setFiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState(null); 
  const [tempFiles, setTempFiles] = useState([]);
  const [newFileDetails, setNewFileDetails] = useState({ price: '', description: '' });
  const [searchQuery, setSearchQuery] = useState(''); 
  const [filteredFiles, setFilteredFiles] = useState(files); 
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false)
  const [cid, setCid] = useState('');
  const [dummyLink, setDummyLink] = useState('');
  const [isProvidersModalOpen, setIsProvidersModalOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [filter, setFilter] = useState("All")

  
  function openFile(file) {
    if (file.isFolder) return; 
    setCurrentFile(file);
    setIsViewerOpen(true);
  }

  function closeViewer() {
    setIsViewerOpen(false);
    setCurrentFile(null);
  }
  

  const dummyProviders = [
    {ip: "127.0.0.1", price: 2},
    {ip: "10.0.0.1", price: 9},
    {ip: "192.168.0.1", price: 5},
    {ip: "132.145.0.1", price: 8},
  ]

  const dummyCid = "baguqeerasorqs4njcts6vs7qvdjfcvgnume4hqohf65zsfguprqphs3icwea"

  const handleSelectProvider = (provider) => {
    setSelectedProvider(provider);
  };


  function handleFileUpload(event) {
    const selectedFiles = Array.from(event.target.files);
    setTempFiles(selectedFiles)
    setIsModalOpen(true); 
  }
  
  function handleDownload(file) {
    const url = URL.createObjectURL(file.fileObject)
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  

  function handleDownloadFile() {
    setIsDownloadModalOpen(true)
  }

  function handleCidChange(e) {
    setCid(e.target.value);

  }
  function openShareModal(file) {
    setDummyLink(`https://sharelink.com/${file.name}`);
    setCurrentFile(file);
    setIsShareModalOpen(true);
  }

  function closeShareModal() {
    setIsShareModalOpen(false);
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(dummyLink);
    alert('Link copied to clipboard!');
  }

  function closeDownloadModal() {
    setCid("")
    setIsDownloadModalOpen(false)
  }

  function closeProvidersModal() {
    setIsProvidersModalOpen(false)
  }

  function showProvidersModal() {
    closeDownloadModal()
    setIsProvidersModalOpen(true)
  }

  function dummyDownload() {
    const dummyFile = {
      name: `Dummy File ${files.length }`, 
      size: 100,
      status: 'unlocked',
      source: 'downloaded',
      price: '1', 
      description: 'Dummy description', 
      isFolder: false,
    };

    const updatedFiles = [...files, dummyFile];
    setFiles(updatedFiles);
 
    const filtered = updatedFiles.filter(file => {
      return (file.source === filter || filter === "All") && file.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    setFilteredFiles(filtered);    
    setIsProvidersModalOpen(false)
    setSelectedProvider(null)
    
  }

    fetch('./dummydata/dummyTestFile.txt')
    .then((response) => response.text())
    .then((fileContent) => {
      const dummyFile = {
        name: "dummyTestFile.txt",
        size: fileContent.length, 
        status: 'unlocked',
        source: 'local',
        price: '599',
        fileObject: new Blob([fileContent], { type: "text/plain" }),
        description: 'Dummy description',
        isFolder: false,
        type: "text/plain"
      };
      const updatedFiles = [...files, dummyFile];
      setFiles(updatedFiles);
      setFilteredFiles(updatedFiles);
    setIsProvidersModalOpen(false);
    setSelectedProvider(null);
  });
}
  

  function handleModalSubmit() {

    const newFiles = tempFiles.map(file => ({
      name: file.name,
      size: file.size,
      status: 'unlocked',
      source: 'uploaded',
      price: newFileDetails.price,
      description: newFileDetails.description,
      fileObject: file,  
      isFolder: false,
      type: file.type,
      price: newFileDetails.price,        
      description: newFileDetails.description
    }));
    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    const filtered = updatedFiles.filter(file => {
      return (file.source === filter || filter === "All") && file.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    setFilteredFiles(filtered);   

    setTempFiles([]); 
    setNewFileDetails({ price: '', description: '' }); 
    setIsModalOpen(false);
  }

  function handleModalClose() {
    setTempFiles([]); 
    setNewFileDetails({ price: '', description: '' }); 
    setIsModalOpen(false); 
  }


  function openFileDetails(file) {
    setCurrentFile(file); // Set the clicked file details    
    setIsFileModalOpen(true); // Open the file details modal
    console.log("Current File is: ", currentFile);
  }

  function closeFileModal() {
    setIsFileModalOpen(false); 
  }


  function handleSearchInput(e) {
    const query = e.target.value;
    setSearchQuery(query);

    const filtered = files.filter(file => {
      return (file.source === filter || filter === "All") && file.name.toLowerCase().includes(query.toLowerCase())      
    }
    );    
    setFilteredFiles(filtered);
  }

  function FilterByAll() {
    setFilter("All")
    setFilteredFiles(files)
  }
  function FilterByDownloaded() {
    setFilter("downloaded")
    const downloadedFiles = files.filter((file) => file.source === "downloaded")
    setFilteredFiles(downloadedFiles)

  }  
  function FilterByUploaded() {
    setFilter("uploaded")
    const uploadedFiles = files.filter((file) => file.source === "uploaded")
    setFilteredFiles(uploadedFiles)
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

      <div className='filter-section'>
        <button className={`filter-button ${filter === "All" ? "active" : ""}`} onClick={FilterByAll}> All </button>
        <button className={`filter-button ${filter === "downloaded" ? "active" : ""}`} onClick={FilterByDownloaded}> Downloaded </button>
        <button className={`filter-button ${filter === "uploaded" ? "active" : ""}`} onClick={FilterByUploaded}> Uploaded </button>
      </div>

      <div className="file-section">
        <table className="file-table">
          <thead>
            <tr>
              <th>name</th>
              <th>type</th>
              <th>size</th>
              <th>source</th>
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
                  <td> {file.source} </td>
                  <td>{new Date().toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleDownload(file)}>
                      <DownloadIcon />
                    </button>
                    <button onClick={() => {
                                        return openFile(file)}}>
                      Open
                    </button>
                    <button onClick={() => openShareModal(file)}>
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

      {isViewerOpen && currentFile && (
            <FileViewer file={currentFile} closeViewer={closeViewer} />
          )}

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Enter File Details</h2>
            <div style={{fontSize: "20px"}}> 
              <label style={{marginRight: "10px"}}>Price:</label> 
                <input
                  type='number'
                  min={0}
                  value={newFileDetails.price}
                  onChange={(e) => setNewFileDetails({ ...newFileDetails, price: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e') {
                      e.preventDefault();
                    }
                  }}
                  style={{marginRight: "10px", fontSize: "18px"}}
                />
                SealTokens
            </div>

            <textarea
              value={newFileDetails.description}
              maxLength={150}
              onChange={(e) => setNewFileDetails({ ...newFileDetails, description: e.target.value })}
              placeholder="Enter description"
              style={{fontSize: "18px"}}
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
          <div className="modal-content"  style={{textAlign: "left", width}}>
            <h2>File Details</h2>
            <p><strong>Name:</strong> {currentFile.name}</p>
            <p><strong>Size:</strong> {formatFileSize(currentFile.size)}</p>
            <p><strong>Price:</strong> {currentFile.price + " Seal Token"}</p>
            <p><strong>Description:</strong> {currentFile.description}</p>
            <p><strong>File CID:</strong> {dummyCid}</p>
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
                      <button onClick={showProvidersModal} style={{fontSize: '20px'}} disabled={cid.trim() === ''}>Find Providers</button>
                    </div>
                  </div>


                </div>
              </div>
            )}
      {isShareModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Share File</h2>
            <p>Copy the link below to share the file:</p>
            <input
              type="text"
              value={dummyLink}
              readOnly
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button onClick={copyToClipboard}>Copy Link</button>
            <div className="modal-actions">
              <button onClick={closeShareModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {isProvidersModalOpen && (
              <div className="modal">
                <div className="modal-content" style={{maxWidth: "600px"}}>
                    <h2> Found Providers </h2>
                      {dummyProviders.map((provider, index) => (
                        <div
                          key={index}
                          className={`provider-item ${ selectedProvider && selectedProvider.ip === provider.ip && selectedProvider.price === provider.price ? 'selected' : ''}`}
                          onClick={() => handleSelectProvider(provider)}
                        >
                          <p>IP: {provider.ip}</p>
                          <p>Price: {provider.price} SealTokens</p>
                        </div>
                      ))}

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',  
                      alignItems: 'center',
                      marginTop: '150px'
                    }}>
                      <div className='modal-actions'>
                        <button onClick={closeProvidersModal} style={{fontSize: '20px'}}> Close </button>
                      </div>
                      <div className='modal-actions'>
                        <button onClick={dummyDownload} style={{fontSize: '20px'}}>Download</button>
                      </div>
                    
                    </div>
                  </div>
                </div>
            )}

    </div>
  );


function formatFileSize(size) {
  if (size === 0) return 'Folder';
  const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
}

export default FilesPage;