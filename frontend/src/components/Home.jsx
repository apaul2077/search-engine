// src/components/Home.jsx
import React, { useRef, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import SearchBar from './SearchBar';
import api from '../api';
import logo from '../assets/fire-flame-curved.svg';

export default function Home() {
  const { query, handleSearch } = useOutletContext();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const doSearch = term => {
    handleSearch(term);
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  const handleUploadClick = () => fileInputRef.current.click();

  const handleFileChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(res.data.msg);
    } catch {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="search-container">
      <div className="title-line">
        <img src={logo} alt="Logo" className="logo" />
        <div className="title-line-text">Search</div>
      </div>

      <div className="home-search-container">
        <SearchBar initial={query} onSearch={doSearch} />

        <div>
          <button
            onClick={handleUploadClick}
            disabled={uploading}
            className="upload-button"
          >
            {uploading
              ? <FaSpinner className="spinner" />
              : "Upload PDF"}
          </button>
          <input
            type="file"
            accept="application/pdf"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
      </div>


      {uploading && <div className="upload-popup">Uploading & Updating…</div>}
      <div className='disclaimer-text'>
        Curretly there are some DSA books uploaded for sample searches. It takes 3-4min to update model when a new book is uploaded.
      </div>
    </div>
  );
}
