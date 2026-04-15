import React, { useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api/auth';

function Login({ onLogin, switchToRegister }) {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await axios.post(`${API}/login`, form);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            onLogin(res.data.user);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            background: '#080d1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '16px'
        }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                        <div style={{ width: '9px', height: '9px', background: '#38bdf8', borderRadius: '2px' }}></div>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                        <div style={{ width: '5px', height: '5px', background: '#818cf8', borderRadius: '1px' }}></div>
                        <div style={{ width: '5px', height: '5px', background: '#f472b6', borderRadius: '1px' }}></div>
                    </div>
                </div>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '700', color: '#e2e8f0' }}>KD-Tree</span>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#64748b' }}>Spatial Query Handler</span>
            </div>

            {/* Tech chips */}
            <div style={{ display: 'flex', gap: '6px' }}>
                {['KD-Tree', 'MongoDB', 'React', 'Node.js'].map((t, i) => {
                    const colors = ['#38bdf8', '#34d399', '#818cf8', '#fb923c'];
                    const bgs = ['rgba(56,189,248,0.08)', 'rgba(52,211,153,0.08)', 'rgba(129,140,248,0.08)', 'rgba(251,146,60,0.08)'];
                    const borders = ['#1e3a5f', '#065f46', '#2d2f5e', '#3d1a06'];
                    return (
                        <span key={i} style={{
                            padding: '2px 10px',
                            borderRadius: '20px',
                            fontSize: '9px',
                            border: `1px solid ${borders[i]}`,
                            background: bgs[i],
                            color: colors[i]
                        }}>{t}</span>
                    );
                })}
            </div>

            {/* Login Card */}
            <div style={{
                background: '#0b1120',
                border: '0.5px solid #1a2540',
                borderRadius: '12px',
                padding: '28px',
                width: '320px'
            }}>
                <h3 style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: '500', margin: '0 0 4px' }}>
                    Welcome back
                </h3>
                <p style={{ color: '#475569', fontSize: '10px', margin: '0 0 20px' }}>
                    Sign in to your account to continue
                </p>

                {error && (
                    <div style={{
                        background: 'rgba(251,113,133,0.08)',
                        border: '1px solid #4c1d2a',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        color: '#fb7185',
                        fontSize: '10px',
                        marginBottom: '14px'
                    }}>
                        {error}
                    </div>
                )}

                <label style={{ color: '#64748b', fontSize: '9px', display: 'block', marginBottom: '4px' }}>
                    Email address
                </label>
                <input
                    type="email"
                    placeholder="tanu@gmail.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    style={{
                        width: '100%',
                        background: '#080d1a',
                        border: '0.5px solid #1a2540',
                        borderRadius: '5px',
                        padding: '8px 10px',
                        color: '#e2e8f0',
                        fontSize: '11px',
                        marginBottom: '12px',
                        outline: 'none'
                    }}
                />

                <label style={{ color: '#64748b', fontSize: '9px', display: 'block', marginBottom: '4px' }}>
                    Password
                </label>
                <input
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    style={{
                        width: '100%',
                        background: '#080d1a',
                        border: '0.5px solid #1a2540',
                        borderRadius: '5px',
                        padding: '8px 10px',
                        color: '#e2e8f0',
                        fontSize: '11px',
                        marginBottom: '16px',
                        outline: 'none'
                    }}
                />

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    style={{
                        width: '100%',
                        background: '#38bdf8',
                        border: 'none',
                        borderRadius: '5px',
                        padding: '9px',
                        color: '#080d1a',
                        fontSize: '11px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    margin: '16px 0'
                }}>
                    <div style={{ flex: 1, height: '0.5px', background: '#1a2540' }}></div>
                    <span style={{ color: '#334155', fontSize: '9px' }}>or</span>
                    <div style={{ flex: 1, height: '0.5px', background: '#1a2540' }}></div>
                </div>

                <p style={{ textAlign: 'center', color: '#475569', fontSize: '10px', margin: 0 }}>
                    Don't have an account?{' '}
                    <span
                        onClick={switchToRegister}
                        style={{ color: '#818cf8', cursor: 'pointer' }}
                    >
                        Register here
                    </span>
                </p>
            </div>
        </div>
    );
}

export default Login;