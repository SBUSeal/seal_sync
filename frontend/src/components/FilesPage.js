import React, {useState} from 'react';
import axios from 'axios';
import '../stylesheets/Files.css';

const Files = () => {

  const [file, setFile] = useState()

  function handleChange(event) {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    // console.log(selectedFile.name);
  }

  function handleSubmit(event) {
    event.preventDefault()
    const url = 'http://localhost:8080/uploadFile';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    // console.log(file.name);

    const config = {
      headers: {
        'content-type': 'multipart/form-data',
      },
    };
    axios.post(url, formData, config).then((response) => {
      //console.log(response.data);
    });

  }

  return (
    <div>
      {/* Buttons for actions */}
      <div className="buttons">
        <form onSubmit={handleSubmit}>
          <input type="file" onChange={handleChange}/>
          <button className="btn btn-network">Upload to Network</button>
          <button className="btn btn-local">Upload Local</button>
        </form>
      </div>

      {/* File Table */}
      <table className="file-table">
        <thead>
          <tr>
            <th>File Name</th>
            <th>Size</th>
            <th>Date Uploaded</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>example.txt</td>
            <td>2 MB</td>
            <td>2024-09-30</td>
            <td><button>Download</button> <button>Delete</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Files;