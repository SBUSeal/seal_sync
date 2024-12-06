
import React, { useState, useEffect } from 'react';

import '../stylesheets/FilesPage.css';
import FileViewer from './FileViewer';  
import ShareModal from './FilesPageComponents/ShareModal';
import FileModal from './FilesPageComponents/FileModal';
import DownloadModal from './FilesPageComponents/DownloadModal';
import ProvidersModal from './FilesPageComponents/ProvidersModal';
import UploadModal from './FilesPageComponents/UploadModal';
import FileTable from './FilesPageComponents/FileTable';
import TopBar from './FilesPageComponents/TopBar';

const FilesPage = (props) => {

  const files = props.files
  const setFiles = props.setFiles
  const setDownloadsInProgress = props.setDownloadsInProgress; 
  // Modal States
  const [isUploadModalOpen, setisUploadModalOpen] = useState(false); 
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isProvidersModalOpen, setIsProvidersModalOpen] = useState(false)
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false)
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const [currentFile, setCurrentFile] = useState(null); 
  const [tempFile, setTempFile] = useState(null);
  const [newFileDetails, setNewFileDetails] = useState({ price: '', description: '', timeLimited: false, unpublishTime: '' });
  const [searchQuery, setSearchQuery] = useState(''); 
  const [filteredFiles, setFilteredFiles] = useState(files); 
  const [cid, setCid] = useState('');
  const [dummyLink, setDummyLink] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [filter, setFilter] = useState("All")
  const [providers, setProviders] = useState([])


  useEffect(() => {
    const updateFilteredFiles = () => {
      const filtered = files.filter(file => 
        (file.source === filter || filter === "All") && file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFiles(filtered);
    };
    updateFilteredFiles();
  }, [files, searchQuery, filter]);

  useEffect(() => {
    const uploadCount = files.filter(file => file.source === 'uploaded').length;
    const downloadCount = files.filter(file => file.source === 'downloaded').length;

    localStorage.setItem('uploadedFilesCount', uploadCount);
    localStorage.setItem('downloadedFilesCount', downloadCount);
  }, [files]); 

  useEffect(() => {
    const getFiles = async () => {
      try {
        let files = await fetch('http://localhost:8080/files', {
          method: 'GET',
        })
        files = await files.json() || []        
        setFiles(files)
      } catch (err) {
        console.error("Error fetching files: ", err)
      }
    }
    getFiles()
    
  }, [])

  function closeViewer() {
    setIsViewerOpen(false);
    setCurrentFile(null);
  }

  function openShareModal(file) {
    setDummyLink(`https://sharelink.com/${file.name}`);
    setCurrentFile(file);
    setIsShareModalOpen(true);
  }

  function closeDownloadModal() {
    setIsDownloadModalOpen(false)
  }

  async function showProvidersModal() {
    try {
      const response = await fetch('http://localhost:8080/providers/' + cid, {
          method: 'GET',
      });

      if (response.ok) {
        try{
          const providers = await response.json()
          setProviders(providers)
        } catch (error) {
          console.error("Error getting the providers JSON body: ", error);
        }         
      } else {
          console.error('Finding Providers failed:', response.statusText);
      }
    } catch (error) {
        console.error(error);
    }
    closeDownloadModal()
    setIsProvidersModalOpen(true)
  }


  function triggerNonBlobDownload(url) {
    const a = document.createElement('a')
    a.href = url
    a.download = ''
    a.style.display = 'none';
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    return null
  }

  async function triggerBlobDownload(url, filename) {
    const response = await fetch(url, {
      method: "GET"
    })
    const blob = await response.blob()
    
    // Trigger blob download
    const a = document.createElement('a');
    const obj_url = URL.createObjectURL(blob);
    a.href = obj_url;
    a.download = filename;  
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(obj_url);
    document.body.removeChild(a);
    return blob
  }

  async function downloadFile() {
    try {      

      const url = `http://localhost:8080/download/${cid}/${selectedProvider.peer_id}`
      // Get file metadata
      const response = await fetch(url, {
        method: 'HEAD'
      })
      let downloadedFile = {
        name: response.headers.get("Name"),
        price: response.headers.get("Price"),
        description: response.headers.get("Description"),
        size: parseInt(response.headers.get("Size")),
        cid: response.headers.get("Cid"),
        dateAdded: response.headers.get("DateAdded"),
        source: response.headers.get("Source")
      }      
      

      // If file > 50 MB, dont use a blob to download it
      // Also means we wont be able to show a preview of it
      let blob;
      if (downloadedFile.size > 50 * 1024 * 1024) {
        blob = await triggerNonBlobDownload(url)
      }
      else {
        blob = await triggerBlobDownload(url, downloadedFile.name)
      }
      downloadedFile.fileObject = blob

      setFiles([...files, downloadedFile]);
  
      const filtered = files.filter(file => {
        return (file.source === filter || filter === "All") && file.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
  
      setFilteredFiles(filtered);    
      setIsProvidersModalOpen(false)
      setSelectedProvider(null)
      setCid("")

      const newBalance = props.sealTokenBalance - downloadedFile.price;
      if (newBalance < 0) {
        alert("Insufficient funds, cannot download file")
        return
      }
      props.setSealTokenBalance(newBalance)
      alert(`Successfully bought file for ${downloadedFile.price} STK!`)
  
      //add new transaction
      props.setTransactions((prevTransactions) => [...prevTransactions, {
        id: prevTransactions.length + 1,
        type: 'Sent',
        date: new Date().toLocaleString(),
        to: "default address",
        sealTokens: downloadedFile.price,
        reason: downloadedFile.name + " purchased from files",
      },] )

    } catch (error) {
      console.log("Error downloading")
      console.error(error)
    }
  }

  async function uploadFile() {
    const formData = new FormData();
    formData.append('file', tempFile);
    formData.append('price', newFileDetails.price)
    formData.append('size', tempFile.size)
    formData.append('description', newFileDetails.description)
    formData.append('dateAdded', new Date().toLocaleDateString())    
    formData.append('unpublishTime', newFileDetails.unpublishTime)

    try {
      const response = await fetch('http://localhost:8080/upload', {
          method: 'POST',
          body: formData,
      });

      if (response.ok) {
          const result = await response;
          console.log('Successfuly Uploaded File:', result);
          return await result.json()
      } else {
          console.error('Upload failed:', response.statusText);
      }
    } catch (error) {
        console.error('Error uploading file:', error);
    }
  }
  
  async function handleUploadModalSubmit() {
    try {
      const newlyUploadedFile = await uploadFile()      
            
      setFiles([...files, newlyUploadedFile]);
      const filtered = files.filter(file => {
        return (file.source === filter || filter === "All") && file.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
  
      setFilteredFiles(filtered);   
    } catch (error) {
      console.error("Error uploading file")
    }
    
    setTempFile(null); 
    setNewFileDetails({ price: '', description: '', timeLimited: false, unpublishTime: '' }); 
    setisUploadModalOpen(false);
  }

  function handleUploadModalClose() {
    setTempFile(null); 
    setNewFileDetails({ price: '', description: '', timeLimited: false, unpublishTime: '' }); 
    setisUploadModalOpen(false); 
  }

  function formatFileSize(size) {
    if (size === 0) return 'Folder';
    const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
  }


  return (
    <div className="file-manager-container">
      <TopBar
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      files={files}
      filter={filter}
      setFilteredFiles={setFilteredFiles}
      setIsDownloadModalOpen={setIsDownloadModalOpen}
      setTempFile={setTempFile}
      setisUploadModalOpen={setisUploadModalOpen}
      setCid={setCid}
      > 
      </TopBar>
      <div className="file-section">
        <FileTable 
        files={files} setFiles={setFiles} 
        filteredFiles={filteredFiles} setFilteredFiles={setFilteredFiles} 
        formatFileSize={formatFileSize} 
        setDownloadsInProgress={setDownloadsInProgress} 
        setCurrentFile={setCurrentFile} 
        setIsViewerOpen={setIsViewerOpen}
        openShareModal={openShareModal}
        setIsFileModalOpen={setIsFileModalOpen}
        filter={filter}
        setFilter={setFilter}
        > 
        </FileTable>
      </div>
      {isViewerOpen && currentFile && (<FileViewer file={currentFile} closeViewer={closeViewer} />)}
      {isUploadModalOpen && <UploadModal newFileDetails ={newFileDetails} setNewFileDetails={setNewFileDetails} handleUploadModalClose={handleUploadModalClose} handleUploadModalSubmit={handleUploadModalSubmit}> </UploadModal>}
      {isFileModalOpen && currentFile && <FileModal currentFile={currentFile} formatFileSize={formatFileSize} setIsFileModalOpen={setIsFileModalOpen}> </FileModal>}
      {isDownloadModalOpen &&  <DownloadModal cid={cid} setCid={setCid} closeDownloadModal={closeDownloadModal} showProvidersModal={showProvidersModal} > </DownloadModal>}
      {isShareModalOpen && <ShareModal file = {currentFile} setIsShareModalOpen= {setIsShareModalOpen} dummyLink={dummyLink}> </ShareModal>}
      {isProvidersModalOpen && providers && <ProvidersModal providers={providers} setProviders={setProviders} selectedProvider={selectedProvider} setSelectedProvider={setSelectedProvider} setIsProvidersModalOpen={setIsProvidersModalOpen} balance={props.sealTokenBalance} downloadFile={downloadFile}> </ProvidersModal>}
    </div>
  );
}

export default FilesPage;