import React, { useEffect, useState } from 'react';

const FileViewer = ({ file, closeViewer }) => {
  const [fileContent, setFileContent] = useState('');

  useEffect(() => {
    if (file && file.fileObject && file.fileObject.type?.startsWith('text/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileContent(e.target.result); 
      };
      reader.readAsText(file.fileObject);
    }
  }, [file]);

  if (!file || !file.fileObject) {
    return (
      <div className="modal">
        <div className="modal-content">
          <h2>File Error</h2>
          <p>Unable to display file content.</p>
          <div className="modal-actions">
            <button onClick={closeViewer}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  const isImageFile = file.fileObject.type?.startsWith('image/');
  const isTextFile = file.fileObject.type?.startsWith('text/');
  const isPdfFile = file.fileObject.type === 'application/pdf';

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Viewing: {file.name}</h2>

        {isImageFile && (
          <img
            src={URL.createObjectURL(file.fileObject)}
            alt={file.name}
            style={{ maxWidth: '100%', height: 'auto', marginBottom: '20px' }}
          />
        )}

        {isTextFile && (
          <textarea
            readOnly
            value={fileContent || ''}
            style={{ 
              width: '100%', 
              height: '300px', 
              padding: '10px', 
              fontFamily: 'monospace', 
              color: 'black',  
              backgroundColor: 'white' 
            }}
          ></textarea>
        )}

        {isPdfFile && (
          <embed
            src={URL.createObjectURL(file.fileObject)}
            type="application/pdf"
            width="100%"
            height="500px"
            style={{ marginBottom: '20px' }}
          />
        )}

        {!isImageFile && !isTextFile && !isPdfFile && (
          <p>This File type is currently not supported for viewing.</p>
        )}

        <div className="modal-actions">
          <button onClick={closeViewer}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default FileViewer;
