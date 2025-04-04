import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './components/Home.jsx';
import SearchResults from './components/SearchResults.jsx';
import PDFViewer from './components/PDFViewer.jsx';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import Profile from './components/Profile.jsx';
import api from './api';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get('/auth/me')
      .then(res => {
        if (res.data.loggedIn) {
          setUser(res.data.email);
          console.log('User verified:', res.data.email);
        } else {
          setUser(null);
          console.log('User not logged in');
        }
      })
      .catch(err => {
        console.error('User verification failed:', err);
        setUser(null);
      });
  }, []);
  

  return (
    <div>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/pdf/:filename/:page" element={<PDFViewer />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup setUser={setUser} />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
}

export default App;
