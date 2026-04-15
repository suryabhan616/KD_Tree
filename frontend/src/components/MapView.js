import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom marker icon
const blueIcon = new L.Icon({
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapView({ locations = [], results = [] }) {
  const center = [22.5, 78.9]; // India center

  return (
    <div className="map-container" style={{ flex: 1, position: 'relative' }}>
      <MapContainer
        center={center}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
      >
        {/* 🌍 Map tiles */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 📍 All stored locations */}
        {locations.map((loc) => (
          <Marker
            key={loc._id}
            position={[loc.latitude, loc.longitude]}
            icon={blueIcon}
          >
            <Popup>
              <strong>{loc.name || 'Unknown Location'}</strong><br />
              Lat: {loc.latitude}<br />
              Lon: {loc.longitude}<br />
              Zone: {loc.zone || 'default'}
            </Popup>
          </Marker>
        ))}

        {/* 🔍 Search / query results (skip duplicates already shown above) */}
        {results.map((item, index) => {
          const loc = item.point || item;

          if (!loc || !loc.latitude || !loc.longitude) return null;

          // Don't render a duplicate pin if already shown as a stored location
          const isAlreadyShown = locations.some((l) => l._id === loc._id);
          if (isAlreadyShown) return null;

          return (
            <Marker
              key={`result-${index}`}
              position={[loc.latitude, loc.longitude]}
              icon={blueIcon}
            >
              <Popup>
                <strong>{loc.name || 'Unknown Location'}</strong><br />
                Lat: {loc.latitude}<br />
                Lon: {loc.longitude}<br />
                {item.distance && `Distance: ${item.distance.toFixed(2)} km`}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Empty state hint */}
      {locations.length === 0 && results.length === 0 && (
        <div style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          zIndex: 1000
        }}>
          🔍 Search or Range query to see locations
        </div>
      )}
    </div>
  );
}

export default MapView;