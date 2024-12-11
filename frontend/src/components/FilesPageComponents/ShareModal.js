import React, { useState } from 'react';

const ShareModal = ({ file, setIsShareModalOpen, notifStatus }) => {
  const [generatedLink, setGeneratedLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const showNotification = (message, type) => {
    if (
        notifStatus === 'None' ||
        (notifStatus === 'Urgent' && type !== 'error')
    ) {
        return;
    }
        setNotification({ message, type });
        setTimeout(() => {
            setNotification({ message: '', type: '' });
        }, 3000);
    };
  
  const closeShareModal = () => {
    setGeneratedLink('');
    setIsShareModalOpen(false);
  };

  const copyLinkToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard
        .writeText(generatedLink)
        .then(() => {
          //alert('Link copied to clipboard!');
          showNotification('Link copied to clipboard!', 'success');
        })
        .catch((err) => {
          console.error('Failed to copy link:', err);
          //alert('Failed to copy the link. Please try again.');
          showNotification('Failed to copy the link. Please try again.', 'error');
        });
    } else {
      //alert('No link generated to copy.');
      showNotification('No link generated to copy.', 'error');
    }
  };

  const generateLink = async () => {
    setIsLoading(true);
    try {
      // Fetch the generated link from the backend
      const response = await fetch(`http://localhost:8080/generateFileLink?file=${file.name}`);
      if (response.ok) {
        const data = await response.json();
        setGeneratedLink(data.link); // Store the generated link
        console.log(`Generated Link: ${data.link}`); // Debugging log
      } else {
        //alert('Failed to generate the shareable link');
        showNotification('Failed to generate the shareable link', 'error');
        console.error('Error generating link:', response.statusText);
      }
    } catch (error) {
      //alert('Error generating the shareable link');
      showNotification('Error generating the shareable link', 'error');
      console.error('Error:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="modal">
      <div className="modal-content" style={{ width: '500px' }}>
        <h2>Share File</h2>
        <button
          onClick={generateLink}
          disabled={isLoading}
          className="modal-content"
          style={{ marginBottom: '10px', border: '1px lightgrey solid' }}
        >
          {isLoading ? 'Generating...' : 'Generate Share Link'}
        </button>
        {generatedLink && (
          <div>
            <input
              className="modal-content"
              type="text"
              value={generatedLink}
              readOnly
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <button
              onClick={copyLinkToClipboard}
              className="modal-content"
              style={{ border: '1px lightgrey solid' }}
            >
              Copy Link
            </button>
          </div>
        )}
        <h2 style={{ marginTop: '5px' }}>Or</h2>
        <p style={{ marginBottom: '10px' }}>Copy the file CID below</p>
        <input
          type="text"
          value={file.cid}
          readOnly
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <button
          className="modal-content"
          onClick={() => {
            navigator.clipboard.writeText(file.cid);
            //alert('CID copied to clipboard!');
            showNotification('CID copied to clipboard!', 'success');
          }}
          style={{ border: '1px lightgrey solid' }}
        >
          Copy CID
        </button>
        <div className="modal-actions">
          <button onClick={closeShareModal}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
