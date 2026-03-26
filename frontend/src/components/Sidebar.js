import React, { useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api/locations';

function Sidebar({ onLocationAdded, onNearestResult, onRangeResult, onActivity }) {

    const [addForm, setAddForm] = useState({ name: '', latitude: '', longitude: '' });
    const [nearestForm, setNearestForm] = useState({ latitude: '', longitude: '', k: 3 });
    const [rangeForm, setRangeForm] = useState({ minLat: '', maxLat: '', minLon: '', maxLon: '' });

    // Add Location
    const handleAdd = async () => {
        try {
            const res = await axios.post(`${API}/add`, {
                name: addForm.name,
                latitude: parseFloat(addForm.latitude),
                longitude: parseFloat(addForm.longitude)
            });
            onLocationAdded(res.data.location);
            onActivity(`New location "${addForm.name}" added at ${addForm.latitude}, ${addForm.longitude}`);
            setAddForm({ name: '', latitude: '', longitude: '' });
        } catch (err) {
            alert('Error adding location');
        }
    };

    // Find Nearest
    const handleNearest = async () => {
        try {
            const res = await axios.post(`${API}/nearest`, {
                latitude: parseFloat(nearestForm.latitude),
                longitude: parseFloat(nearestForm.longitude),
                k: parseInt(nearestForm.k)
            });
            onNearestResult(res.data.results);
            onActivity(`Nearest query ran — ${res.data.results.length} results found`);
        } catch (err) {
            alert('Error finding nearest locations');
        }
    };

    // Range Query
    const handleRange = async () => {
        try {
            const res = await axios.post(`${API}/range`, {
                minLat: parseFloat(rangeForm.minLat),
                maxLat: parseFloat(rangeForm.maxLat),
                minLon: parseFloat(rangeForm.minLon),
                maxLon: parseFloat(rangeForm.maxLon)
            });
            onRangeResult(res.data.results);
            onActivity(`Range query executed — ${res.data.results.length} locations found`);
        } catch (err) {
            alert('Error running range query');
        }
    };

    return (
        <div className="sidebar">

            {/* Add Location */}
            <div className="card">
                <h3>+ Add Location</h3>
                <input
                    placeholder="Location Name"
                    value={addForm.name}
                    onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                />
                <input
                    placeholder="Latitude (e.g. 28.7041)"
                    value={addForm.latitude}
                    onChange={e => setAddForm({ ...addForm, latitude: e.target.value })}
                />
                <input
                    placeholder="Longitude (e.g. 77.1025)"
                    value={addForm.longitude}
                    onChange={e => setAddForm({ ...addForm, longitude: e.target.value })}
                />
                <button onClick={handleAdd}>Add Location</button>
            </div>

            {/* Find Nearest */}
            <div className="card">
                <h3>Find Nearest</h3>
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
                    placeholder="How many results? (default 3)"
                    value={nearestForm.k}
                    onChange={e => setNearestForm({ ...nearestForm, k: e.target.value })}
                />
                <button onClick={handleNearest}>Find Nearest</button>
            </div>

            {/* Range Query */}
            <div className="card">
                <h3>Range Query</h3>
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
                <button onClick={handleRange}>Run Range Query</button>
            </div>

        </div>
    );
}

export default Sidebar;