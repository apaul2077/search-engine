import React, { useState } from 'react';
import api from '../api';

function Upload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      return alert('Please select a file.');
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert(res.data.msg);
    } catch (err) {
      console.error("Upload error:", err);
      alert('Upload failed: ' + (err.response?.data?.msg || "Unknown error"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="form-container">
      {uploading ? (
        <h2 style={{ textAlign: 'center', padding: '2rem' }}>
          Uploading file and updating the model, please wait...
        </h2>
      ) : (
        <>
          <h2>Upload PDF</h2>
          <form onSubmit={handleUpload}>
            <input 
              type="file" 
              onChange={handleFileChange} 
              accept="application/pdf" 
              className="input"
            />
            <button type="submit" className="button">Upload</button>
          </form>
        </>
      )}
    </div>
  );
}

export default Upload;
