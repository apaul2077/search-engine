import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import logo from '../assets/fire-flame-curved.svg';
import buffering from '../assets/buffering.gif';
import { FaSpinner } from 'react-icons/fa';

function Home({searchedFromHome, setSearchedFromHome}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch spelling suggestion when user stops typing (debounce effect)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        fetchCorrection(searchTerm);
      }
    }, 500); // Wait 500ms before fetching correction

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch spelling correction from API
  const fetchCorrection = async (query) => {
    try {
      const res = await fetch(`https://api.datamuse.com/sug?s=${query}`);
      const data = await res.json();
      if (data.length > 0 && data[0].word.toLowerCase() !== query.toLowerCase()) {
        setSuggestion(data[0].word);
      } else {
        setSuggestion('');
      }
    } catch (error) {
      console.error('Error fetching correction:', error);
    }
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchedFromHome(true); // Set the flag to indicate search was triggered from home
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  // Apply suggested correction
  const applyCorrection = () => {
    setSearchTerm(suggestion);
    setSuggestion('');
  };

  // Trigger hidden file input when "Upload PDF" is clicked
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Handle file selection and upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    
    setTimeout(async () => {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert(res.data.msg);
      } catch (error) {
        console.error('Upload error:', error);
        alert('Upload failed');
      } finally {
        setUploading(false);
      }
    }, 0);
  };

  return (
    <div className="search-container">
      <div className='title-line'>
        <img src={logo} alt="Your SVG" className='logo' />
        <div className='title-line-text'>Search</div>
      </div> 
      
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
          placeholder="Enter your search query..."
          spellCheck="true" // Enables native spell check
        />
        
        {/* Suggestion box */}
        {suggestion && (
          <div className="suggestion-box">
            Did you mean <span className="suggestion" onClick={applyCorrection}>{suggestion}</span>?
          </div>
        )}

        <div style={{ marginTop: '20px' }}>
          <button type="submit" className="button">Search</button>
          <button
            type="button"
            onClick={handleUploadClick}
            className="button"
            style={{ marginLeft: '10px' }}
            disabled={uploading}
          >
            {uploading ? <FaSpinner className="spinner" style={{ marginRight: '5px', animation: 'spin 1s linear infinite' }} /> : "Upload PDF"}
          </button>
          <input
            type="file"
            accept="application/pdf"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
            disabled={uploading}
            spellCheck="true"
          />
        </div>
      </form>

      {uploading && (
        <div className="upload-popup">
          Uploading and Updating model...
        </div>
      )}

      <div className='disclaimer-text'>
        Curretly there are some DSA books uploaded for sample searches. It takes 3-4min to update model when a new book is uploaded.
      </div>
    </div>
  );
}

export default Home;
