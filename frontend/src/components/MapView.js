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

// Marker icon
const blueIcon = new L.Icon({
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapView({ locations, results }) {
  const center = [22.5, 78.9]; // India center

  return (
    <div className="map-container" style={{ flex: 1 }}>
      <MapContainer
        center={center}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
      >
        {/* ✅ GOOGLE-LIKE MAP (REAL NAMES) */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 📍 Locations */}
        {locations.map((loc) => (
          <Marker
            key={loc._id}
            position={[loc.latitude, loc.longitude]}
            icon={blueIcon}
          >
            <Popup>
              <strong>{loc.name}</strong><br />
              Lat: {loc.latitude}<br />
              Lon: {loc.longitude}<br />
              Zone: {loc.zone || 'default'}
            </Popup>
          </Marker>
        ))}

        {/* 🔍 Results */}
        {results.map((item, index) => {
          const loc = item.point || item;
          const isExisting = locations.some((l) => l._id === loc._id);

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
                {item.distance &&
                  `Distance: ${item.distance.toFixed(2)} km`}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default MapView;