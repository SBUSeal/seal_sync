import React from 'react'

const DownloadModal = ({cid, setCid, closeDownloadModal, showProvidersModal}) => {
  return (
    <div className="modal">
    <div className="modal-content" style={{maxWidth: "600px"}}>
      <label style={{fontSize: "20px", display: 'block'}} htmlFor="cidInput"> <h2> Enter File CID </h2></label>
      <input
        className='cid-input'
        type="text"
        id="cidInput"
        value={cid}
        onChange={(e) => setCid(e.target.value)}
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
  )
}

export default DownloadModal
