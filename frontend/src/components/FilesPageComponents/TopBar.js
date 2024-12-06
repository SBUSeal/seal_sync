import React from 'react'
import { DownloadIcon, UploadIcon } from '@radix-ui/react-icons';

const TopBar = ({searchQuery, setSearchQuery, files, filter, setFilteredFiles, setIsDownloadModalOpen, setTempFile, setisUploadModalOpen, setCid}) => {

    function handleSearchInput(e) {
        const query = e.target.value;
        setSearchQuery(query);

        const filtered = files.filter(file => {
            return (file.source === filter || filter === "All") && file.name.toLowerCase().includes(query.toLowerCase())      
        }
        );    
        setFilteredFiles(filtered);
    }

    function handleDownloadFile() {
        setIsDownloadModalOpen(true)
        setCid("")
    }

    function handleFileUpload(event) {
        const selectedFile = Array.from(event.target.files)[0];
        setTempFile(selectedFile)
        setisUploadModalOpen(true); 
        
      }
  return (
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
            <input type="file" onChange={handleFileUpload} />
          </button>
        </div>
    </div>
  )
}

export default TopBar
