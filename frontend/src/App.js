import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import ResultCards from './components/ResultCards';
import ActivityFeed from './components/ActivityFeed';

const API = 'http://localhost:5000/api/locations';

function App() {
    const [locations, setLocations] = useState([]);
    const [results, setResults] = useState([]);
    const [resultType, setResultType] = useState('');
    const [activities, setActivities] = useState([]);

    // Load all locations on startup
    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            const res = await axios.get(`${API}/all`);
            setLocations(res.data);
        } catch (err) {
            console.log('Error fetching locations:', err);
        }
    };

    const handleLocationAdded = (location) => {
        setLocations(prev => [...prev, location]);
    };

    const handleNearestResult = (data) => {
        setResults(data);
        setResultType('nearest');
    };

    const handleRangeResult = (data) => {
        setResults(data);
        setResultType('range');
    };

    const handleActivity = (message) => {
        setActivities(prev => [...prev, message]);
    };

    return (
        <div className="app">

            {/* Header */}
            <div className="header">
                <h1>KD-Tree Spatial Query Handler</h1>
                <span>
                    {locations.length} locations in database
                </span>
            </div>

            {/* Main Content */}
            <div className="main-content">

                {/* Left Sidebar */}
                <Sidebar
                    onLocationAdded={handleLocationAdded}
                    onNearestResult={handleNearestResult}
                    onRangeResult={handleRangeResult}
                    onActivity={handleActivity}
                />

                {/* Center Map */}
                <MapView
                    locations={locations}
                    results={results}
                />

                {/* Right Results Panel */}
                <ResultCards
                    results={results}
                    type={resultType}
                />

            </div>

            {/* Bottom Activity Feed */}
            <ActivityFeed activities={activities} />

        </div>
    );
}

export default App;
