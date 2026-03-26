import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom glowing blue marker
const blueIcon = new L.Icon({
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

// Custom purple marker for results
const purpleIcon = new L.DivIcon({
    className: '',
    html: `<div style="
        width: 16px;
        height: 16px;
        background: #8b5cf6;
        border: 2px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 0 10px #8b5cf6;
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
});

function MapView({ locations, results }) {
    return (
        <div className="map-container">
            <MapContainer
                center={[22.5, 78.9]}
                zoom={5}
                style={{ height: '100%', width: '100%' }}
            >
                {/* Dark themed map tiles */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />

                {/* Show all locations as blue markers */}
                {locations.map((loc) => (
                    <Marker
                        key={loc._id}
                        position={[loc.latitude, loc.longitude]}
                        icon={blueIcon}
                    >
                        <Popup>
                            <div style={{ color: '#000', fontWeight: 'bold' }}>
                                {loc.name}
                            </div>
                            <div style={{ color: '#555', fontSize: '0.8rem' }}>
                                {loc.latitude}, {loc.longitude}
                            </div>
                            <div style={{ color: '#3b82f6', fontSize: '0.75rem' }}>
                                {loc.zone}
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Show query results as purple markers */}
                {results.map((item, index) => {
                    const loc = item.point || item;
                    return (
                        <Marker
                            key={index}
                            position={[loc.latitude, loc.longitude]}
                            icon={purpleIcon}
                        >
                            <Popup>
                                <div style={{ color: '#000', fontWeight: 'bold' }}>
                                    {loc.name}
                                </div>
                                {item.distance && (
                                    <div style={{ color: '#8b5cf6', fontSize: '0.8rem' }}>
                                        {item.distance.toFixed(2)} km away
                                    </div>
                                )}
                            </Popup>
                        </Marker>
                    );
                })}

            </MapContainer>
        </div>
    );
}

export default MapView;