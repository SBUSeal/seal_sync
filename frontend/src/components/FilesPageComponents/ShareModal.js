import React from 'react'
import { useState } from 'react'

const ShareModal = ({ file, setIsShareModalOpen, dummyLink }) => {
   
    const [hasGeneratedLink, setHasGeneratedLink] = useState(false)

    const closeShareModal = () => {
        setHasGeneratedLink(false)
        setIsShareModalOpen(false)
    }

    const copyLinkToClipboard = () => {
      navigator.clipboard.writeText(dummyLink);
      alert('Link copied to clipboard!');
    }


  return (
    <div className="modal">
    <div className="modal-content"  style={{width:'500px'}}>
      <h2>Share File</h2>
      <button onClick={()=>setHasGeneratedLink(true)} className='modal-content' style={{marginBottom: "10px", border:'1px lightgrey solid'}}>Generate Share Link </button>
      {hasGeneratedLink && <div> 
        <input
        className='modal-content'
          type="text"
          value={dummyLink}
          readOnly
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <button className='modal-content' style={{border:'1px lightgrey solid'}} onClick={copyLinkToClipboard}> 
          Copy Link
        </button>
      </div>}
      <h2  style={{marginTop: "5px"}}> Or </h2>
      <p  style={{marginBottom: "10px"}}> Copy the file CID below </p>
      <input
        type="text"
        value={file.cid}
        readOnly
        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
      />
      <button className='modal-content' style={{border:'1px lightgrey solid'}}onClick={() => {
        navigator.clipboard.writeText(file.cid);
        alert('CID copied to clipboard!');
      }}>Copy CID </button>
      <div className="modal-actions">
        <button onClick={closeShareModal}>Close</button>
      </div>
    </div>
  </div>
  )
}

export default ShareModal
