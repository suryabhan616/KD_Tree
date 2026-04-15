import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
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
  html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 6px ${color}88"></div>`,
  iconSize: [14, 14], iconAnchor: [7, 7],
});

const API = 'http://localhost:5000/api/locations';

function FlyTo({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, 6, { duration: 1.2 }); }, [center, map]);
  return null;
}

function UserDashboard({ user, onLogout }) {
  const [locations, setLocations] = useState([]);
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState('Locations');
  const [queryMode, setQueryMode] = useState('Range search');
  const [queryLat, setQueryLat] = useState('17.38');
  const [queryLng, setQueryLng] = useState('78.48');
  const [queryKR, setQueryKR] = useState('4');
  const [queryResults, setQueryResults] = useState([]);
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', latitude: '', longitude: '', zone: 'Zone A' });
  const [distDist, setDistDist] = useState([]);
  const [nearestKm, setNearestKm] = useState(null);
  const [inRange, setInRange] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { loadLocations(); }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2800); };

  const loadLocations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/all`);
      setLocations(res.data);
    } catch (e) { showToast('Error loading locations'); }
    finally { setLoading(false); }
  };

  const runQuery = async () => {
    try {
      setLoading(true);
      if (queryMode === 'Range search') {
        const radius = parseFloat(queryKR);
        const lat = parseFloat(queryLat), lng = parseFloat(queryLng);
        const res = await axios.post(`${API}/nearest`, { latitude: lat, longitude: lng, k: locations.length });
        const inR = res.data.results.filter(r => r.distance <= radius * 100);
        setQueryResults(res.data.results);
        setInRange(inR.length);
        const dists = res.data.results.slice(0, 6).map(r => ({ name: r.point?.name || r.name, dist: Math.round(r.distance) }));
        setDistDist(dists);
        if (dists.length > 0) setNearestKm(dists[0].dist);
        setMapCenter([lat, lng]);
        showToast(`Range query: ${inR.length} in range`);
      } else {
        const res = await axios.post(`${API}/nearest`, { latitude: parseFloat(queryLat), longitude: parseFloat(queryLng), k: parseInt(queryKR) });
        setQueryResults(res.data.results);
        const dists = res.data.results.map(r => ({ name: r.point?.name || r.name, dist: Math.round(r.distance) }));
        setDistDist(dists);
        if (dists.length > 0) setNearestKm(dists[0].dist);
        setInRange(res.data.results.length);
        showToast(`Nearest search: ${res.data.results.length} found`);
      }
    } catch (e) { showToast('Error running query'); }
    finally { setLoading(false); }
  };

  const handleAdd = async () => {
    if (!addForm.name || !addForm.latitude || !addForm.longitude) { showToast('Fill all fields'); return; }
    try {
      const res = await axios.post(`${API}/add`, { name: addForm.name, latitude: parseFloat(addForm.latitude), longitude: parseFloat(addForm.longitude), zone: addForm.zone });
      setLocations(prev => [...prev, res.data.location]);
      setAddForm({ name: '', latitude: '', longitude: '', zone: 'Zone A' });
      setShowAddForm(false);
      showToast(`✓ Added ${addForm.name}`);
    } catch (e) { showToast('Error adding location'); }
  };

  const exportData = () => {
    const data = JSON.stringify(locations, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'locations.json'; a.click();
    showToast('Exported!');
  };

  const filteredLocs = zoneFilter ? locations.filter(l => (l.zone || 'Zone A') === zoneFilter) : locations;
  const uniqueZones = [...new Set(locations.map(l => l.zone || 'Zone A'))];
  const maxDist = Math.max(...distDist.map(d => d.dist), 1);

  return (
    <div className="dash-root">
      {toast && <div className="toast">{toast}</div>}

      {/* TOP NAV */}
      <header className="dash-nav">
        <div className="nav-left">
          <span className="nav-logo">🌐</span>
          <span className="nav-brand">GeoSpatial Dashboard</span>
        </div>
        <div className="nav-pills">
          <div className="nav-pill active">{locations.length} <span>locations</span></div>
          <div className="nav-pill">{uniqueZones.length} <span>zones</span></div>
          <div className="nav-pill">KD-Tree <span>active</span></div>
        </div>
        <div className="nav-right">
          <button className="nav-btn" onClick={exportData}>↓ Export</button>
          <button className="nav-btn" onClick={() => showToast('Share link copied!')}>⊙ Share</button>
          <button className="nav-btn primary" onClick={() => setShowAddForm(true)}>+ Add location</button>
          <div className="nav-user" onClick={onLogout} title="Click to logout">
            <span className="user-avatar">{user.username[0].toUpperCase()}</span>
            <span className="user-name">{user.username}</span>
            <span className="user-role">user</span>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="dash-body">
        {/* LEFT PANEL */}
        <div className="left-panel">
          <div className="panel-tabs">
            {['Locations', 'Zones', 'Add'].map(t => (
              <button key={t} className={activeTab === t ? 'ptab active' : 'ptab'} onClick={() => { setActiveTab(t); if (t === 'Add') setShowAddForm(true); }}>
                {t}
              </button>
            ))}
          </div>

          {/* STATS */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-num">{locations.length}</div>
              <div className="stat-label">Total points</div>
              <div className="stat-sub">+1 today</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{uniqueZones.length}</div>
              <div className="stat-label">Active zones</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{nearestKm ?? '—'}</div>
              <div className="stat-label">Nearest (km)</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">{inRange}</div>
              <div className="stat-label">In range</div>
            </div>
          </div>

          {/* LOCATION LIST */}
          <div className="loc-list">
            {filteredLocs.map((loc, i) => {
              const zone = loc.zone || 'Zone A';
              const color = zoneColor(zone);
              const isResult = queryResults.some(r => (r.point?._id || r._id) === loc._id);
              return (
                <div
                  key={loc._id || i}
                  className={`loc-item ${selectedLoc?._id === loc._id ? 'selected' : ''} ${isResult ? 'result' : ''}`}
                  onClick={() => { setSelectedLoc(loc); setMapCenter([loc.latitude, loc.longitude]); }}
                >
                  <div className="loc-dot" style={{ background: color }} />
                  <div className="loc-info">
                    <div className="loc-name">{loc.name}</div>
                    <div className="loc-zone">{zone}{isResult && ' · query result'}</div>
                  </div>
                  <div className="loc-coords">{loc.latitude?.toFixed(2)}, {loc.longitude?.toFixed(2)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MAP */}
        <div className="map-wrap">
          <MapContainer center={[22.5, 78.9]} zoom={5} className="leaflet-map" zoomControl={false}>
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="&copy; Esri" />
            {mapCenter && <FlyTo center={mapCenter} />}

            {queryMode === 'Range search' && mapCenter && (
              <Circle center={mapCenter} radius={parseFloat(queryKR) * 10000} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f644', weight: 1 }} />
            )}

            {filteredLocs.map((loc, i) => {
              const zone = loc.zone || 'Zone A';
              const color = zoneColor(zone);
              const isResult = queryResults.some(r => (r.point?._id || r._id) === loc._id);
              return (
                <Marker key={loc._id || i} position={[loc.latitude, loc.longitude]} icon={makeIcon(isResult ? '#fff' : color)}>
                  <Popup className="dark-popup">
                    <b>{loc.name}</b><br />
                    {zone}<br />
                    {loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)}
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* MAP OVERLAY LEGEND */}
          <div className="map-legend">
            {Object.entries(ZONE_COLORS).filter(([k]) => k !== 'default').map(([zone, color]) => (
              <div key={zone} className="legend-item" onClick={() => setZoneFilter(zoneFilter === zone ? null : zone)}>
                <div className="legend-dot" style={{ background: color }} />
                <span>{zone}</span>
              </div>
            ))}
          </div>
          <div className="map-info-badge">
            <span>KD-Tree active</span>
            <span>Zoom 5×</span>
            <span>India · {locations.length} points visible</span>
          </div>
        </div>

        {/* RIGHT PANEL - QUERY BUILDER */}
        <div className="right-panel">
          <div className="qb-header">QUERY BUILDER</div>

          <div className="qb-field">
            <label>Mode</label>
            <select value={queryMode} onChange={e => setQueryMode(e.target.value)}>
              <option>Range search</option>
              <option>Nearest K</option>
            </select>
          </div>

          <div className="qb-field">
            <label>Lat</label>
            <input value={queryLat} onChange={e => setQueryLat(e.target.value)} placeholder="17.38" />
          </div>

          <div className="qb-field">
            <label>Lng</label>
            <input value={queryLng} onChange={e => setQueryLng(e.target.value)} placeholder="78.48" />
          </div>

          <div className="qb-field">
            <label>K / R</label>
            <input value={queryKR} onChange={e => setQueryKR(e.target.value)} placeholder="4" />
          </div>

          <button className="run-btn" onClick={runQuery} disabled={loading}>
            {loading ? '⏳ Running...' : '▶ Run query'}
          </button>

          <div className="qb-actions">
            <button className="qb-act" onClick={runQuery}>⊙ Range</button>
            <button className="qb-act" onClick={() => setZoneFilter(null)}>⊙ Zone filter</button>
            <button className="qb-act" onClick={() => { setQueryResults([]); setDistDist([]); setNearestKm(null); setInRange(0); }}>✕ Clear</button>
          </div>

          {/* QUERY RESULTS */}
          {queryResults.length > 0 && (
            <div className="qr-list">
              {queryResults.slice(0, 5).map((r, i) => {
                const loc = r.point || r;
                const zone = loc.zone || 'Zone A';
                return (
                  <div key={i} className="qr-item">
                    <div className="qr-name">{loc.name}</div>
                    <div className="qr-coords">{loc.latitude?.toFixed(2)}, {loc.longitude?.toFixed(2)}</div>
                    <div className="qr-tags">
                      <span className="tag north">north</span>
                      <span className="tag dist">{Math.round(r.distance)} km</span>
                      <span className="tag zone">{zone}</span>
                    </div>
                    <div className="qr-num">#{i + 1}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* DISTANCE DISTRIBUTION */}
          {distDist.length > 0 && (
            <div className="dist-section">
              <div className="dist-header">DISTANCE DISTRIBUTION</div>
              {distDist.map((d, i) => (
                <div key={i} className="dist-row">
                  <span className="dist-name">{d.name}</span>
                  <div className="dist-bar-wrap">
                    <div className="dist-bar" style={{ width: `${(d.dist / maxDist) * 100}%`, background: Object.values(ZONE_COLORS)[i % 4] }} />
                  </div>
                  <span className="dist-val">{d.dist}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ADD LOCATION MODAL */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span>+ Add Location</span>
              <button onClick={() => setShowAddForm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <input placeholder="Location Name" value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} />
              <input placeholder="Latitude (e.g. 28.61)" value={addForm.latitude} onChange={e => setAddForm({ ...addForm, latitude: e.target.value })} />
              <input placeholder="Longitude (e.g. 77.21)" value={addForm.longitude} onChange={e => setAddForm({ ...addForm, longitude: e.target.value })} />
              <select value={addForm.zone} onChange={e => setAddForm({ ...addForm, zone: e.target.value })}>
                <option>Zone A</option>
                <option>Zone B</option>
                <option>Zone C</option>
              </select>
              <button className="run-btn" onClick={handleAdd}>Add Location</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
