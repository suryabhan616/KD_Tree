import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Blue marker for locations
const blueIcon = new L.Icon({
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapView({ locations, results }) {
  // Center map on India
  const center = [22.5, 78.9];

  return (
    <div className="map-container">
      <MapContainer
        center={center}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

        {/* All Locations */}
        {locations.map(loc => (
          <Marker key={loc._id} position={[loc.latitude, loc.longitude]} icon={blueIcon}>
            <Popup>
              <strong>{loc.name}</strong><br />
              Lat: {loc.latitude}<br />
              Lon: {loc.longitude}<br />
              Zone: {loc.zone || 'default'}
            </Popup>
          </Marker>
        ))}

        {/* Optional: Show search results with different color */}
        {results.map((item, index) => {
          const loc = item.point || item;
          // Only show if not already in locations (to avoid duplicates)
          const isExisting = locations.some(l => l._id === loc._id);
          if (isExisting) return null;
          
          return (
            <Marker 
              key={`result-${index}`} 
              position={[loc.latitude, loc.longitude]} 
              icon={blueIcon}
            >
              <Popup>
                <strong>{loc.name}</strong><br />
                Lat: {loc.latitude}<br />
                Lon: {loc.longitude}<br />
                {item.distance && `Distance: ${item.distance.toFixed(2)} km`}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default MapView;