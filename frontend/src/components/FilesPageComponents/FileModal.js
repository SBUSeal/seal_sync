import React from 'react'

const FileModal = ({currentFile, formatFileSize, setIsFileModalOpen}) => {
  return (
    <div className="modal">
        <div className="modal-content"  style={{textAlign: "left"}}>
            <h2>File Details</h2>
            <p><strong>Name:</strong> {currentFile.name}</p>
            <p><strong>Size:</strong> {formatFileSize(currentFile.size)}</p>
            <p><strong>Price:</strong> {currentFile.price + " STK"}</p>
            <p><strong>Description:</strong> {currentFile.description}</p>
            {currentFile.unpublishTime &&  <p><strong>Unpublish Time:</strong> {currentFile.unpublishTime}</p>}
        <div className="modal-actions" style={{marginTop: "30px"}}>
            <button onClick={() => setIsFileModalOpen(false)}>Close</button>
        </div>
    </div>
  </div>
  )
}

export default FileModal
