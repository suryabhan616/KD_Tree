import React, { useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api/auth';

function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '', email: '', role: 'user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.username || !form.password) { setError('Please fill all fields'); return; }
    setLoading(true); setError('');
    try {
      const endpoint = mode === 'login' ? '/login' : '/register';
      const res = await axios.post(`${API}${endpoint}`, form);
      if (res.data.success) onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-bg">
      <div className="login-glow" />
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">🌐</div>
          <h1 className="login-title">GeoSpatial<br /><span>Dashboard</span></h1>
          <p className="login-sub">KD-Tree Powered · Spatial Intelligence</p>
        </div>

        <div className="login-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(''); }}>Sign In</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError(''); }}>Register</button>
        </div>

        <div className="login-form">
          <div className="field-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {mode === 'register' && (
            <div className="field-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
          )}

          <div className="field-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {mode === 'register' && (
            <div className="field-group">
              <label>Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          {error && <div className="login-error">{error}</div>}

          <button className="login-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="spin">◌</span> : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </div>

        <div className="login-hints">
          <span>Demo: <b>admin</b> / admin123</span>
          <span>Demo: <b>user</b> / user123</span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;