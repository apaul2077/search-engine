import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Signup({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/signup', { email, password });
      const res = await api.post('/auth/login', { email, password });
      setUser({ email });
      navigate('/');
    } catch (error) {
      console.error("Signup error", error);
      alert("Signup failed: " + (error.response?.data?.msg || "Unknown error"));
    }
  };

  return (
    <div className='center'>
      <div className="form-container">
        <div className='auth-title-text'>Signup</div>
        <form onSubmit={handleSubmit} className='inside-form-container'>
          <input 
            type="email"
            className="input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password"
            className="input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="button">Signup</button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
