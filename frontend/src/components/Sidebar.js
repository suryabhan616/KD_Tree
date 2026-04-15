import React, { useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api/locations';

function Sidebar({ onNearestResult, onRangeResult, onActivity }) {
  const [searchName, setSearchName] = useState('');
  const [minLat, setMinLat] = useState('');
  const [maxLat, setMaxLat] = useState('');
  const [minLon, setMinLon] = useState('');
  const [maxLon, setMaxLon] = useState('');

  // 🔍 Name Search
  const handleSearch = async () => {
    if (!searchName.trim()) return;

    try {
      const res = await axios.get(`${API}/search?name=${searchName}`);
      const data = res.data.results || res.data;

      onNearestResult(data);
      onActivity(`🔍 Searched: ${searchName}`);
    } catch (err) {
      console.error(err);
      onActivity('❌ Search failed');
    }
  };

  // 📦 Range Search
  const handleRangeSearch = async () => {
    try {
      const res = await axios.post(`${API}/range`, {
        minLat: Number(minLat),
        maxLat: Number(maxLat),
        minLon: Number(minLon),
        maxLon: Number(maxLon),
      });

      const data = res.data.results || res.data;

      console.log("RANGE RESULT:", data); // 🔥 debug

      onRangeResult(data);
      onActivity(`📦 Range search: ${data.length} results`);
    } catch (err) {
      console.error(err);
      onActivity('❌ Range search failed');
    }
  };

  const handleClear = () => {
    onNearestResult([]);
    onRangeResult([]);
    setSearchName('');
  };

  return (
    <div className="sidebar">

      {/* 🔍 NAME SEARCH */}
      <div className="glass" style={{ padding: '15px', marginBottom: '15px' }}>
        <h3>🔍 Search Location</h3>

        <input
          type="text"
          placeholder="Enter location name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />

        <button onClick={handleSearch}>Search</button>
        <button onClick={handleClear}>Clear</button>
      </div>

      {/* 📦 RANGE SEARCH */}
      <div className="glass" style={{ padding: '15px' }}>
        <h3>📦 Range Search</h3>

        <input placeholder="Min Latitude" value={minLat} onChange={(e) => setMinLat(e.target.value)} />
        <input placeholder="Max Latitude" value={maxLat} onChange={(e) => setMaxLat(e.target.value)} />
        <input placeholder="Min Longitude" value={minLon} onChange={(e) => setMinLon(e.target.value)} />
        <input placeholder="Max Longitude" value={maxLon} onChange={(e) => setMaxLon(e.target.value)} />

        <button onClick={handleRangeSearch}>Search Range</button>
      </div>

    </div>
  );
}

export default Sidebar;