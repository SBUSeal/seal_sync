import React from 'react'
import { LayersIcon, DownloadIcon, FileIcon, Share1Icon, TrashIcon, DotsVerticalIcon } from '@radix-ui/react-icons'


const FileTable = ({files, setFiles, filteredFiles, setFilteredFiles, formatFileSize, setDownloadsInProgress, setCurrentFile, setIsViewerOpen, openShareModal, setIsFileModalOpen, filter, setFilter}) => {

  async function unpublishFile(file) {
    try {
      const response = await fetch(`http://localhost:8080/unpublishFile/${file.cid}`, {
        method: 'GET',
      });
      if (response.ok) {
        return true
    } else {
        console.error('Bad response code:', response.statusText);
    }
    } catch (err) {
      console.error("Error unpublishing file: ", err)
    }
  }

  async function publishFile(file) {
    try {
      const response = await fetch(`http://localhost:8080/publishFile/${file.cid}`, {
        method: 'GET',
      });
      if (response.ok) {
        return true
    } else {
        console.error('Bad response code:', response.statusText);
    }
    } catch (err) {
      console.error("Error publishing file: ", err)
    }
  }

  async function handleToggle(event, file) {
    const isChecked = event.target.checked;
    const updatedFiles = files.map(f => 
      f.name === file.name ? { ...f, published: isChecked } : f
    );
    setFiles(updatedFiles);
    setFilteredFiles(updatedFiles);
    if (!isChecked) {
      await unpublishFile(file)
    } else {
      await publishFile(file)
    }
  }
  
  function handleResume(file) {
    setFiles(prevFiles =>
      prevFiles.map(f =>
        f.name === file.name ? { ...f, paused: false } : f
      )
    );
  }

  function handlePause(file) {
    setFiles(prevFiles =>
      prevFiles.map(f =>
        f.name === file.name ? { ...f, paused: true } : f
      )
    );
    setDownloadsInProgress(prevFiles =>
      prevFiles.map(f =>
        f.name === file.name ? { ...f, paused: true } : f
      )
    );
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

  function openFile(file) {
    setCurrentFile(file);
    setIsViewerOpen(true);
  }

  async function deleteFile(file) {
    const endpoint = (file.source === "uploaded" ? "UploadedFile" : "DownloadedFile")
    try {
      const response = await fetch(`http://localhost:8080/delete${endpoint}/${file.cid}`, {
        method: 'GET',
      });
      if (response.ok) {
        return true
    } else {
        console.error('Bad response code:', response.statusText);
    }
    } catch (err) {
      console.error("Error deleting file: ", err)
    }
  }

  async function handleDeleteFile(file) {
    const confirmed = window.confirm(`Are you sure you want to delete the file: ${file.name}?`);
    const res = await deleteFile(file)

    if (confirmed && res) {
      const updatedFiles = files.filter(f => f.name !== file.name);
      setFiles(updatedFiles);
      setFilteredFiles(updatedFiles);
    }
  }

  function openFileDetails(file) {
    setCurrentFile(file); 
    setIsFileModalOpen(true); 
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
    <>
      <div className='filter-section'>
        <button className={`filter-button ${filter === "All" ? "active" : ""}`} onClick={FilterByAll}> All </button>
        <button className={`filter-button ${filter === "downloaded" ? "active" : ""}`} onClick={FilterByDownloaded}> Downloaded </button>
        <button className={`filter-button ${filter === "uploaded" ? "active" : ""}`} onClick={FilterByUploaded}> Uploaded </button>
      </div>
      <table className="file-table">
      <thead>
        <tr>
          <th>name</th>
          <th>type</th>
          <th>size</th>
          <th>source</th>
          <th>date added</th>
          <th>published</th>
          <th></th>
        </tr>
      </thead>
      {filteredFiles.length === 0 ? (
        <tbody>
          <tr>
            <td colSpan="7" className="no-files-message">No files match your search</td>
          </tr>
        </tbody>
      ) : (
        <tbody>
          {filteredFiles.map((file, index) => ( 
            <tr key={index} style={{ color: 'red' }}>
              <td>
                {<FileIcon />} {file.name}
              </td>
              <td>{'File'}</td>
              <td>{formatFileSize(file.size)}</td>
              <td> {file.source === 'uploaded'? 'local': 'seal-network'} </td>
              <td>{new Date(file.dateAdded).toLocaleDateString('en-US')}</td>
              
              {((!file.downloading) && (file.source === 'uploaded'))?
                            <td>
                              <label className="switch">
                                  <input
                                    style={{outline: "none", boxShadow: "none"}}
                                    type="checkbox" 
                                    checked={file.published}
                                    onChange={(e) => handleToggle(e, file)} 
                                  />
                                  <span className="slider round"></span>
                              </label>
                            </td>
                :
                        <td>{file.downloading ? (file.paused ? 'Paused' : 'Downloading') : ''}</td>
              }

              {file.downloading ? (
                <td className='icon-cell' >
                  {file.paused ? (
                        <button className="resume-button" onClick={() => handleResume(file)}>
                        Resume
                        </button>
                      ) : (
                        <div className="download-container">
                          <div className="spinner"></div> 
                          <button className='pause-button' onClick={() => handlePause(file)}>
                          Pause
                          </button>
                        </div>
                      )}
                </td>
                ) :
                
              <td className='icon-cell'>
                {/* <button onClick={() => handleDownload(file)} disabled={file.downloading}>
                  <DownloadIcon />
                </button> */}
                {/* <button onClick={() => {
                                    return openFile(file)}} disabled={file.downloading}>
                  Open
                </button> */}
                <button onClick={() => openShareModal(file)} disabled={file.downloading}>
                  <Share1Icon />
                </button>
                {(!file.published || file.source === 'downloaded') && (
                      <button onClick={() => handleDeleteFile(file)}>
                        <TrashIcon />
                      </button>
                    )}
                <button onClick={() => openFileDetails(file)} disabled={file.downloading}>
                  <DotsVerticalIcon />
                </button>
              
              </td>
            }
            </tr>
          ))}
        </tbody>
      )}
    </table>
  </>
  )
}

export default FileTable
