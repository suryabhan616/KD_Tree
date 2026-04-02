import React, { useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api/locations';

function Sidebar({ onLocationAdded, onNearestResult, onRangeResult, onActivity }) {
    const [addForm, setAddForm] = useState({ name: '', latitude: '', longitude: '', zone: 'default' });
    const [nearestForm, setNearestForm] = useState({ latitude: '', longitude: '', k: 3 });
    const [rangeForm, setRangeForm] = useState({ minLat: '', maxLat: '', minLon: '', maxLon: '' });
    const [activeTab, setActiveTab] = useState('add');

    const handleAdd = async () => {
        try {
            const res = await axios.post(`${API}/add`, {
                name: addForm.name,
                latitude: parseFloat(addForm.latitude),
                longitude: parseFloat(addForm.longitude),
                zone: addForm.zone
            });
            onLocationAdded(res.data.location);
            onActivity(`✨ New location "${addForm.name}" added`);
            setAddForm({ name: '', latitude: '', longitude: '', zone: 'default' });
        } catch (err) {
            alert('Error adding location');
        }
    };

    const handleNearest = async () => {
        try {
            const res = await axios.post(`${API}/nearest`, {
                latitude: parseFloat(nearestForm.latitude),
                longitude: parseFloat(nearestForm.longitude),
                k: parseInt(nearestForm.k)
            });
            onNearestResult(res.data.results);
            onActivity(`🎯 Nearest query: ${res.data.results.length} results found`);
        } catch (err) {
            alert('Error finding nearest locations');
        }
    };

    const handleRange = async () => {
        try {
            const res = await axios.post(`${API}/range`, {
                minLat: parseFloat(rangeForm.minLat),
                maxLat: parseFloat(rangeForm.maxLat),
                minLon: parseFloat(rangeForm.minLon),
                maxLon: parseFloat(rangeForm.maxLon)
            });
            onRangeResult(res.data.results);
            onActivity(`📊 Range query: ${res.data.results.length} locations found`);
        } catch (err) {
            alert('Error running range query');
        }
    };

    return (
        <div className="sidebar">
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {['add', 'nearest', 'range'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            flex: 1,
                            padding: '8px',
                            background: activeTab === tab ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.05)',
                            border: 'none',
                            borderRadius: '10px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '500'
                        }}
                    >
                        {tab === 'add' && '➕ '}
                        {tab === 'nearest' && '🔍 '}
                        {tab === 'range' && '📊 '}
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {activeTab === 'add' && (
                <div className="card">
                    <h3>➕ Add Location</h3>
                    <input
                        placeholder="Location Name"
                        value={addForm.name}
                        onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                    />
                    <input
                        placeholder="Latitude"
                        value={addForm.latitude}
                        onChange={e => setAddForm({ ...addForm, latitude: e.target.value })}
                    />
                    <input
                        placeholder="Longitude"
                        value={addForm.longitude}
                        onChange={e => setAddForm({ ...addForm, longitude: e.target.value })}
                    />
                    <select
                        value={addForm.zone}
                        onChange={e => setAddForm({ ...addForm, zone: e.target.value })}
                    >
                        <option value="default">Default Zone</option>
                        <option value="north">North Zone</option>
                        <option value="south">South Zone</option>
                        <option value="east">East Zone</option>
                        <option value="west">West Zone</option>
                    </select>
                    <button onClick={handleAdd}>Add Location</button>
                </div>
            )}

            {activeTab === 'nearest' && (
                <div className="card">
                    <h3>🔍 Find Nearest</h3>
                    <input
                        placeholder="Your Latitude"
                        value={nearestForm.latitude}
                        onChange={e => setNearestForm({ ...nearestForm, latitude: e.target.value })}
                    />
                    <input
                        placeholder="Your Longitude"
                        value={nearestForm.longitude}
                        onChange={e => setNearestForm({ ...nearestForm, longitude: e.target.value })}
                    />
                    <input
                        type="number"
                        placeholder="Number of results (K)"
                        value={nearestForm.k}
                        onChange={e => setNearestForm({ ...nearestForm, k: e.target.value })}
                    />
                    <button onClick={handleNearest}>Find Nearest</button>
                </div>
            )}

            {activeTab === 'range' && (
                <div className="card">
                    <h3>📊 Range Query</h3>
                    <input
                        placeholder="Min Latitude"
                        value={rangeForm.minLat}
                        onChange={e => setRangeForm({ ...rangeForm, minLat: e.target.value })}
                    />
                    <input
                        placeholder="Max Latitude"
                        value={rangeForm.maxLat}
                        onChange={e => setRangeForm({ ...rangeForm, maxLat: e.target.value })}
                    />
                    <input
                        placeholder="Min Longitude"
                        value={rangeForm.minLon}
                        onChange={e => setRangeForm({ ...rangeForm, minLon: e.target.value })}
                    />
                    <input
                        placeholder="Max Longitude"
                        value={rangeForm.maxLon}
                        onChange={e => setRangeForm({ ...rangeForm, maxLon: e.target.value })}
                    />
                    <button onClick={handleRange}>Run Query</button>
                </div>
            )}
        </div>
    );
}

export default Sidebar;