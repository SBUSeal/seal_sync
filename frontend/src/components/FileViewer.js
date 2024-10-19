import React from 'react';

const FileViewer = ({ file, closeViewer }) => {
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

  // Check if the file is an image or text
  const isImageFile = file.fileObject.type?.startsWith('image/');
  const isTextFile = file.fileObject.type?.startsWith('text/');

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Viewing: {file.name}</h2>

        {/* Image file preview */}
        {isImageFile && (
          <img
            src={URL.createObjectURL(file.fileObject)}
            alt={file.name}
            style={{ maxWidth: '100%', height: 'auto', marginBottom: '20px' }}
          />
        )}

        {/* Text file preview */}
        {isTextFile && (
          <textarea
            readOnly
            value={file.content || ''}
            style={{ width: '100%', height: '300px', padding: '10px', fontFamily: 'monospace' }}
          ></textarea>
        )}

        {!isImageFile && !isTextFile && (
          <p>File type not supported for viewing.</p>
        )}

        <div className="modal-actions">
          <button onClick={closeViewer}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default FileViewer;
