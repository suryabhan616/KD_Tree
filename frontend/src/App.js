import React, { useState } from 'react';
import './App.css';
import LoginPage from './components/LoginPage';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => setUser(userData);
  const handleLogout = () => setUser(null);

  if (!user) return <LoginPage onLogin={handleLogin} />;
  if (user.role === 'admin') return <AdminDashboard user={user} onLogout={handleLogout} />;
  return <UserDashboard user={user} onLogout={handleLogout} />;
}

export default App;