import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import SearchLayout from './components/SearchLayout';
import Home from './components/Home';
import SearchResults from './components/SearchResults';
import PDFViewer from './components/PDFViewer';
import Login from './components/Login';
import Signup from './components/Signup';
import Profile from './components/Profile';
import api from './api';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get('/auth/me')
       .then(res => res.data.loggedIn
         ? setUser(res.data.email)
         : setUser(null)
       )
       .catch(() => setUser(null));
  }, []);

  return (
    <div>
      <Navbar user={user} setUser={setUser}/>
      {/* <div className='app-div'> */}
        <Routes>
        <Route path="/" element={<SearchLayout />}>
          <Route index     element={<Home />} />
          <Route path="search" element={<SearchResults />} />
        </Route>
        <Route path="pdf/:filename/:page" element={<PDFViewer />} />
        <Route path="login"   element={<Login setUser={setUser}/>} />
        <Route path="signup"  element={<Signup setUser={setUser}/>} />
        <Route path="profile" element={<Profile />} />
      </Routes>
      {/* </div> */}
      
    </div>
  );
}

export default App;
