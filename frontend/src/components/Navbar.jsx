import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <nav className="navbar">
      <Link to="/">Home</Link>
      {user ? (
        <>
          <Link to="/profile" style={{ marginLeft: '10px' }}>My Profile</Link>
          <button onClick={handleLogout} style={{ marginLeft: '10px' }}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login" style={{ marginLeft: '10px' }}>Login</Link>
          <Link to="/signup" style={{ marginLeft: '10px' }}>Signup</Link>
        </>
      )}
    </nav>
  );
}

export default Navbar;
