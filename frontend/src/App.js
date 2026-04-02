import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

import Sidebar from './components/Sidebar';
import GlobeView from './components/GlobeView';
import ResultCards from './components/ResultCards';
import ActivityFeed from './components/ActivityFeed';

const API = 'http://localhost:5000/api/locations';

function App() {
  const [locations, setLocations] = useState([]);
  const [results, setResults] = useState([]);
  const [resultType, setResultType] = useState('');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, zones: {} });

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/all`);
      setLocations(res.data);
      
      const zones = res.data.reduce((acc, loc) => {
        const zone = loc.zone || 'default';
        acc[zone] = (acc[zone] || 0) + 1;
        return acc;
      }, {});
      setStats({ total: res.data.length, zones });
      
      addActivity(`Loaded ${res.data.length} locations`);
    } catch (err) {
      console.error('Error:', err);
      addActivity('Error loading locations');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationAdded = (location) => {
    setLocations((prev) => [...prev, location]);
    addActivity(`Added new location: ${location.name}`);
  };

  const handleNearestResult = (data) => {
    setResults(data);
    setResultType('nearest');
    addActivity(`Nearest search: ${data.length} results`);
  };

  const handleRangeResult = (data) => {
    setResults(data);
    setResultType('range');
    addActivity(`Range query: ${data.length} results`);
  };

  const addActivity = (message) => {
    const time = new Date().toLocaleTimeString();
    setActivities((prev) => [`[${time}] ${message}`, ...prev].slice(0, 50));
  };

  return (
    <div className="app">
      <div className="header">
        <div className="header-left">
          <h1>
            <span className="gradient-text">🌐 Geo Spatial Dashboard</span>
          </h1>
          <div className="header-badges">
            <span className="badge">🛰️ {locations.length} Locations</span>
            <span className="badge">📡 {Object.keys(stats.zones).length} Zones</span>
          </div>
        </div>
        
        <div className="header-right">
          {loading && (
            <div className="loader">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          )}
          <button className="refresh-btn" onClick={loadLocations}>
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="main-content">
        <Sidebar
          onLocationAdded={handleLocationAdded}
          onNearestResult={handleNearestResult}
          onRangeResult={handleRangeResult}
          onActivity={addActivity}
        />

        <GlobeView locations={locations} results={results} />

        <ResultCards results={results} type={resultType} />
      </div>

      <ActivityFeed activities={activities} />
    </div>
  );
}

export default App;