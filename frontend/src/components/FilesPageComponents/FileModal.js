import React from 'react'

const FileModal = ({currentFile, formatFileSize, setIsFileModalOpen}) => {  
  
  // Ensure that unpublishTime is a valid date
  let unpublishTimeDisplay = currentFile.unpublishTime && new Date(currentFile.unpublishTime).getFullYear() <= 9000 ? 
    new Date(currentFile.unpublishTime).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true, 
      timeZone: 'UTC',
    }) : "None";
  
  return (
    <div className="modal">
        <div className="modal-content"  style={{textAlign: "left"}}>
            <h2>File Details</h2>
            <p><strong>Name:</strong> {currentFile.name}</p>
            <p><strong>Size:</strong> {formatFileSize(currentFile.size)}</p>
            <p><strong>Price:</strong> {currentFile.price + " STK"}</p>
            <p><strong>Description:</strong> {currentFile.description}</p>
            {currentFile.source === "uploaded" && <p><strong>Unpublish Time:</strong> {unpublishTimeDisplay}  </p>} 
        <div className="modal-actions" style={{marginTop: "30px"}}>
            <button onClick={() => setIsFileModalOpen(false)}>Close</button>
        </div>
    </div>
  </div>
  )
}

export default FileModal
