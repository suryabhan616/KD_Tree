import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const ZONE_COLORS = { 'Zone A': '#ef4444', 'Zone B': '#3b82f6', 'Zone C': '#22c55e', 'default': '#f59e0b' };
const zoneColor = (zone) => {
  if (ZONE_COLORS[zone]) return ZONE_COLORS[zone];
  const fb = ['#ef4444','#3b82f6','#22c55e','#f59e0b','#a855f7'];
  let h = 0; for (let i = 0; i < (zone||'').length; i++) h = (h + zone.charCodeAt(i)) % fb.length;
  return fb[Math.abs(h)];
};
const makeIcon = (color) => L.divIcon({
  className: '',
  html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 6px ${color}88"></div>`,
  iconSize: [12, 12], iconAnchor: [6, 6],
});

const LOC_API = 'http://localhost:5000/api/locations';
const AUTH_API = 'http://localhost:5000/api/auth';

function AdminDashboard({ user, onLogout }) {
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeSection, setActiveSection] = useState('overview');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', latitude: '', longitude: '', zone: 'Zone A' });
  const [regForm, setRegForm] = useState({ username: '', password: '', email: '', role: 'user' });
  const [showAddLoc, setShowAddLoc] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);

  useEffect(() => { loadAll(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2800); };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [locRes, userRes] = await Promise.all([
        axios.get(`${LOC_API}/all`),
        axios.get(`${AUTH_API}/users`)
      ]);
      setLocations(locRes.data);
      setUsers(userRes.data);
    } catch (e) { showToast('Error loading data'); }
    finally { setLoading(false); }
  };

  const deleteLocation = async (id) => {
    if (!window.confirm('Delete this location?')) return;
    try {
      await axios.delete(`${LOC_API}/delete/${id}`);
      setLocations(prev => prev.filter(l => l._id !== id));
      showToast('Location deleted');
    } catch (e) { showToast('Error deleting'); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axios.delete(`${AUTH_API}/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
      showToast('User deleted');
    } catch (e) { showToast('Error deleting user'); }
  };

  const addLocation = async () => {
    if (!addForm.name || !addForm.latitude || !addForm.longitude) { showToast('Fill all fields'); return; }
    try {
      const res = await axios.post(`${LOC_API}/add`, { name: addForm.name, latitude: parseFloat(addForm.latitude), longitude: parseFloat(addForm.longitude), zone: addForm.zone });
      setLocations(prev => [...prev, res.data.location]);
      setAddForm({ name: '', latitude: '', longitude: '', zone: 'Zone A' });
      setShowAddLoc(false);
      showToast(`✓ Added ${addForm.name}`);
    } catch (e) { showToast('Error adding location'); }
  };

  const addUser = async () => {
    if (!regForm.username || !regForm.password) { showToast('Fill required fields'); return; }
    try {
      const res = await axios.post(`${AUTH_API}/register`, regForm);
      setUsers(prev => [...prev, res.data.user]);
      setRegForm({ username: '', password: '', email: '', role: 'user' });
      setShowAddUser(false);
      showToast(`✓ User ${regForm.username} created`);
    } catch (e) { showToast(e.response?.data?.error || 'Error creating user'); }
  };

  const exportData = () => {
    const data = JSON.stringify({ locations, users: users.map(u => ({ username: u.username, role: u.role, email: u.email })) }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'geodata-export.json'; a.click();
    showToast('Exported!');
  };

  const uniqueZones = [...new Set(locations.map(l => l.zone || 'Zone A'))];

  return (
    <div className="dash-root">
      {toast && <div className="toast">{toast}</div>}

      {/* TOP NAV */}
      <header className="dash-nav">
        <div className="nav-left">
          <span className="nav-logo">🌐</span>
          <span className="nav-brand">GeoSpatial Dashboard</span>
          <span className="admin-badge">ADMIN</span>
        </div>
        <div className="nav-pills">
          <div className="nav-pill active">{locations.length} <span>locations</span></div>
          <div className="nav-pill">{uniqueZones.length} <span>zones</span></div>
          <div className="nav-pill">{users.length} <span>users</span></div>
          <div className="nav-pill">KD-Tree <span>active</span></div>
        </div>
        <div className="nav-right">
          <button className="nav-btn" onClick={exportData}>↓ Export</button>
          <button className="nav-btn" onClick={loadAll}>⟳ Refresh</button>
          <button className="nav-btn primary" onClick={() => setShowAddLoc(true)}>+ Add location</button>
          <div className="nav-user" onClick={onLogout} title="Click to logout">
            <span className="user-avatar admin">{user.username[0].toUpperCase()}</span>
            <span className="user-name">{user.username}</span>
            <span className="user-role admin-role">admin</span>
          </div>
        </div>
      </header>

      <div className="dash-body">
        {/* LEFT PANEL - ADMIN NAV */}
        <div className="left-panel">
          <div className="admin-nav">
            {[
              { key: 'overview', icon: '⊞', label: 'Overview' },
              { key: 'locations', icon: '📍', label: 'Locations' },
              { key: 'users', icon: '👥', label: 'Users' },
              { key: 'analytics', icon: '📊', label: 'Analytics' },
            ].map(({ key, icon, label }) => (
              <button key={key} className={`admin-nav-item ${activeSection === key ? 'active' : ''}`} onClick={() => setActiveSection(key)}>
                <span>{icon}</span> {label}
              </button>
            ))}
          </div>

          {/* STATS */}
          <div className="stats-grid" style={{ marginTop: 16 }}>
            <div className="stat-card">
              <div className="stat-num">{locations.length}</div>
              <div className="stat-label">Locations</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{users.length}</div>
              <div className="stat-label">Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{users.filter(u => u.role === 'admin').length}</div>
              <div className="stat-label">Admins</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{uniqueZones.length}</div>
              <div className="stat-label">Zones</div>
            </div>
          </div>

          {/* ZONE BREAKDOWN */}
          <div className="zone-breakdown">
            <div className="qb-header" style={{ marginBottom: 10 }}>ZONE BREAKDOWN</div>
            {uniqueZones.map(zone => {
              const count = locations.filter(l => (l.zone || 'Zone A') === zone).length;
              const color = zoneColor(zone);
              return (
                <div key={zone} className="zone-row">
                  <div className="legend-dot" style={{ background: color }} />
                  <span className="zone-name">{zone}</span>
                  <div className="zone-bar-wrap"><div className="zone-bar" style={{ width: `${(count / locations.length) * 100}%`, background: color }} /></div>
                  <span className="zone-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER - MAP or TABLE */}
        <div className="admin-center">
          {(activeSection === 'overview' || activeSection === 'analytics') && (
            <MapContainer center={[22.5, 78.9]} zoom={5} className="leaflet-map" zoomControl={false}>
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="&copy; Esri" />
              {locations.map((loc, i) => {
                const zone = loc.zone || 'Zone A';
                const color = zoneColor(zone);
                return (
                  <Marker key={loc._id || i} position={[loc.latitude, loc.longitude]} icon={makeIcon(color)}>
                    <Popup className="dark-popup">
                      <b>{loc.name}</b><br />{zone}<br />
                      {loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)}
                      <br /><button className="popup-del" onClick={() => deleteLocation(loc._id)}>🗑 Delete</button>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}

          {activeSection === 'locations' && (
            <div className="admin-table-wrap">
              <div className="table-header">
                <span>All Locations ({locations.length})</span>
                <button className="nav-btn primary" onClick={() => setShowAddLoc(true)}>+ Add</button>
              </div>
              <table className="admin-table">
                <thead><tr><th>#</th><th>Name</th><th>Latitude</th><th>Longitude</th><th>Zone</th><th>Actions</th></tr></thead>
                <tbody>
                  {locations.map((loc, i) => (
                    <tr key={loc._id || i}>
                      <td>{i + 1}</td>
                      <td><b>{loc.name}</b></td>
                      <td>{loc.latitude?.toFixed(4)}</td>
                      <td>{loc.longitude?.toFixed(4)}</td>
                      <td><span className="tag zone">{loc.zone || 'Zone A'}</span></td>
                      <td><button className="del-btn" onClick={() => deleteLocation(loc._id)}>🗑 Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeSection === 'users' && (
            <div className="admin-table-wrap">
              <div className="table-header">
                <span>All Users ({users.length})</span>
                <button className="nav-btn primary" onClick={() => setShowAddUser(true)}>+ Add User</button>
              </div>
              <table className="admin-table">
                <thead><tr><th>#</th><th>Username</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u._id || i}>
                      <td>{i + 1}</td>
                      <td><b>{u.username}</b></td>
                      <td>{u.email || '—'}</td>
                      <td><span className={`tag ${u.role === 'admin' ? 'admin-tag' : 'user-tag'}`}>{u.role}</span></td>
                      <td>
                        {u.username !== 'admin' && (
                          <button className="del-btn" onClick={() => deleteUser(u._id)}>🗑 Delete</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RIGHT - QUICK STATS */}
        <div className="right-panel">
          <div className="qb-header">SYSTEM STATUS</div>
          <div className="sys-status">
            <div className="sys-row"><span className="sys-dot green" />Backend API<span className="sys-ok">Online</span></div>
            <div className="sys-row"><span className="sys-dot green" />KD-Tree<span className="sys-ok">Active</span></div>
            <div className="sys-row"><span className="sys-dot green" />MongoDB<span className="sys-ok">Connected</span></div>
            <div className="sys-row"><span className="sys-dot blue" />Map Tiles<span className="sys-ok">Loaded</span></div>
          </div>

          <div className="qb-header" style={{ marginTop: 20 }}>RECENT USERS</div>
          <div className="user-list">
            {users.slice(0, 8).map((u, i) => (
              <div key={i} className="user-row">
                <span className={`user-av ${u.role === 'admin' ? 'admin' : ''}`}>{u.username[0].toUpperCase()}</span>
                <div>
                  <div className="user-row-name">{u.username}</div>
                  <div className="user-row-role">{u.role}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="qb-header" style={{ marginTop: 20 }}>ZONE DISTRIBUTION</div>
          {uniqueZones.map(zone => {
            const count = locations.filter(l => (l.zone || 'Zone A') === zone).length;
            const color = zoneColor(zone);
            return (
              <div key={zone} className="dist-row">
                <span className="dist-name">{zone}</span>
                <div className="dist-bar-wrap">
                  <div className="dist-bar" style={{ width: `${(count / locations.length) * 100}%`, background: color }} />
                </div>
                <span className="dist-val">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ADD LOCATION MODAL */}
      {showAddLoc && (
        <div className="modal-overlay" onClick={() => setShowAddLoc(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><span>+ Add Location</span><button onClick={() => setShowAddLoc(false)}>✕</button></div>
            <div className="modal-body">
              <input placeholder="Location Name" value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} />
              <input placeholder="Latitude" value={addForm.latitude} onChange={e => setAddForm({ ...addForm, latitude: e.target.value })} />
              <input placeholder="Longitude" value={addForm.longitude} onChange={e => setAddForm({ ...addForm, longitude: e.target.value })} />
              <select value={addForm.zone} onChange={e => setAddForm({ ...addForm, zone: e.target.value })}>
                <option>Zone A</option><option>Zone B</option><option>Zone C</option>
              </select>
              <button className="run-btn" onClick={addLocation}>Add Location</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {showAddUser && (
        <div className="modal-overlay" onClick={() => setShowAddUser(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><span>+ Add User</span><button onClick={() => setShowAddUser(false)}>✕</button></div>
            <div className="modal-body">
              <input placeholder="Username*" value={regForm.username} onChange={e => setRegForm({ ...regForm, username: e.target.value })} />
              <input placeholder="Password*" type="password" value={regForm.password} onChange={e => setRegForm({ ...regForm, password: e.target.value })} />
              <input placeholder="Email" type="email" value={regForm.email} onChange={e => setRegForm({ ...regForm, email: e.target.value })} />
              <select value={regForm.role} onChange={e => setRegForm({ ...regForm, role: e.target.value })}>
                <option value="user">User</option><option value="admin">Admin</option>
              </select>
              <button className="run-btn" onClick={addUser}>Create User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
