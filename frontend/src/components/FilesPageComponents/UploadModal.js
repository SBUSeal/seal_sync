import React from 'react'

const UploadModal = ({newFileDetails, setNewFileDetails, handleUploadModalClose, handleUploadModalSubmit}) => {  
  return (
<div className="modal">
          <div className="modal-content">
            <h2>Enter File Details</h2>
            <div style={{fontSize: "20px"}}> 
              <label style={{marginRight: "10px", marginBottom: "10px"}}>Price (STK):</label> 
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
            </div>

            <label style={{marginRight: "10px", marginBottom: "10px", fontSize: 20}}> Description:</label> 
            <textarea
              value={newFileDetails.description}
              maxLength={150}
              onChange={(e) => setNewFileDetails({ ...newFileDetails, description: e.target.value })}
              placeholder="Enter description"
              style={{fontSize: "18px"}}
            ></textarea>


              <div style={{marginTop: "10px"}}>
                  <input 
                    type="checkbox" 
                    id="unpublishCheck" 
                    checked={newFileDetails.timeLimited}
                    onChange={(e) => setNewFileDetails({ ...newFileDetails, timeLimited: e.target.checked })}
                  />
                  <label htmlFor="unpublishCheck" style={{marginLeft: "10px"}}>Make this file accessible for a limited time</label>

                  {newFileDetails.timeLimited && (
                    <div style={{marginTop: "10px"}}>
                      <label style={{marginRight: "10px"}}>Unpublish Time:</label>
                      <input
                        type="datetime-local"
                        value={newFileDetails.unpublishTime}
                        onChange={(e) => setNewFileDetails({ ...newFileDetails, unpublishTime: e.target.value })}
                        style={{fontSize: "18px"}}
                      />
                    </div>
                  )}
                </div>


            <div className="modal-actions">
              <button onClick={handleUploadModalClose}>Cancel</button>
              <button onClick={handleUploadModalSubmit} disabled={newFileDetails.price.trim() === '' || newFileDetails.description.trim() === ''}>Submit</button>
            </div>
          </div>
        </div>
  )
}

export default UploadModal
