import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import './Login.css';

export default function Login() {
  const [passcode, setPasscode] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [shake, setShake]       = useState(false);
  const inputRef = useRef();
  const { login, isLoggedIn }   = useAuth();
  const navigate                = useNavigate();

  useEffect(() => {
    if (isLoggedIn) navigate('/');
    inputRef.current?.focus();
  }, [isLoggedIn, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passcode.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { passcode: passcode.trim() });
      login(data.token, data.role);
      navigate('/');
    } catch {
      setError('Wrong passcode. Only the chosen ones enter. ✨');
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setPasscode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg" />

      <div className={`login-card fade-up ${shake ? 'shake' : ''}`}>
        <div className="login-icon">🎓</div>
        <h1 className="login-title">Batch 2022 – 2026</h1>
        <p className="login-sub">A farewell to remember forever.</p>
        <p className="login-hint">Enter your passcode to unlock this space.</p>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            ref={inputRef}
            type="password"
            className="login-input"
            placeholder="Enter passcode…"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            autoComplete="off"
          />
          {error && <p className="login-error">{error}</p>}
          <button className="login-btn" disabled={loading}>
            {loading ? 'Unlocking…' : 'Enter →'}
          </button>
        </form>
      </div>

      <footer className="login-footer">
        Made with ❤️ by Sujal Bhawsar &nbsp;·&nbsp;
        <a href="https://instagram.com/cosmic_sujal" target="_blank" rel="noreferrer">
          @cosmic_sujal
        </a>
      </footer>
    </div>
  );
}
