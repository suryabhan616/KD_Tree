import React, { useEffect, useRef, useState } from 'react';
import Globe from 'globe.gl';

function GlobeView({ locations, results }) {
  const globeRef = useRef(null);
  const globeInstanceRef = useRef(null);
  const [lastLocationCount, setLastLocationCount] = useState(0);
  const [currentZoom, setCurrentZoom] = useState(1.8);

  useEffect(() => {
    if (!globeRef.current) return;

    globeInstanceRef.current = new Globe(globeRef.current)
      .globeImageUrl('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .pointAltitude(0.05)
      .pointRadius(0.8)
      .pointColor(() => '#6366f1')
      .pointLabel('label')
      .pointsMerge(false)
      .ringsData([]);

    // Center the globe on India
    globeInstanceRef.current.pointOfView({ 
      lat: 22.5,
      lng: 78.9,
      altitude: 1.8
    });
    
    globeInstanceRef.current.controls().autoRotate = false;
    globeInstanceRef.current.controls().enableZoom = true;
    globeInstanceRef.current.controls().enablePan = true;
    globeInstanceRef.current.controls().zoomSpeed = 1.2;
    globeInstanceRef.current.controls().rotateSpeed = 0.8;

    // Listen to zoom changes
    const controls = globeInstanceRef.current.controls();
    
    // Update zoom level on change
    const updateZoom = () => {
      const camera = globeInstanceRef.current.camera();
      const distance = camera.position.length();
      const altitude = distance / 1000000; // Approximate altitude
      setCurrentZoom(altitude);
    };
    
    // Add event listener for camera changes
    if (controls) {
      controls.addEventListener('change', updateZoom);
    }

    return () => {
      if (controls) {
        controls.removeEventListener('change', updateZoom);
      }
      if (globeInstanceRef.current) {
        globeInstanceRef.current._destructor();
      }
    };
  }, []);

  // Update point labels based on zoom level
  useEffect(() => {
    if (!globeInstanceRef.current) return;

    const points = [];

    // Determine if we should show full labels based on zoom
    const isZoomedIn = currentZoom < 1.0;
    const isMediumZoom = currentZoom < 1.5;

    locations.forEach((loc) => {
      // Show different label styles based on zoom level
      let labelHtml = '';
      
      if (isZoomedIn) {
        // Fully zoomed in - show full details
        labelHtml = `
          <div style="
            background: white;
            color: #1f2937;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            white-space: nowrap;
            font-family: 'Inter', sans-serif;
            display: flex;
            align-items: center;
            gap: 6px;
            border-left: 3px solid ${getZoneColor(loc.zone)};
          ">
            <span style="font-size: 18px;">📍</span>
            <div>
              <div>${loc.name}</div>
              <div style="font-size: 10px; color: #64748b;">${loc.latitude}, ${loc.longitude}</div>
            </div>
          </div>
        `;
      } else if (isMediumZoom) {
        // Medium zoom - show name only
        labelHtml = `
          <div style="
            background: white;
            color: #1f2937;
            padding: 6px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            box-shadow: 0 1px 4px rgba(0,0,0,0.2);
            white-space: nowrap;
            font-family: 'Inter', sans-serif;
            display: flex;
            align-items: center;
            gap: 4px;
          ">
            <span style="font-size: 12px;">📍</span>
            ${loc.name}
          </div>
        `;
      } else {
        // Far zoom - show just pin emoji
        labelHtml = `
          <div style="
            background: white;
            color: #1f2937;
            padding: 4px 8px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            white-space: nowrap;
            font-family: 'Inter', sans-serif;
          ">
            📍
          </div>
        `;
      }
      
      points.push({
        lat: loc.latitude,
        lng: loc.longitude,
        name: loc.name,
        zone: loc.zone || 'default',
        type: 'location',
        label: labelHtml,
        size: isZoomedIn ? 1.0 : (isMediumZoom ? 0.8 : 0.6),
        color: getZoneColor(loc.zone)
      });
    });

    // Add search results
    results.forEach(item => {
      const loc = item.point || item;
      const isExisting = locations.some(l => l._id === loc._id);
      const isZoomedIn = currentZoom < 1.0;
      const isMediumZoom = currentZoom < 1.5;
      
      let labelHtml = '';
      
      if (isZoomedIn) {
        labelHtml = `
          <div style="
            background: #ec4899;
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            white-space: nowrap;
            font-family: 'Inter', sans-serif;
            display: flex;
            align-items: center;
            gap: 6px;
          ">
            <span style="font-size: 18px;">📍</span>
            <div>
              <div>${loc.name}</div>
              ${item.distance ? `<div style="font-size: 10px;">${item.distance.toFixed(2)}km away</div>` : ''}
            </div>
          </div>
        `;
      } else if (isMediumZoom) {
        labelHtml = `
          <div style="
            background: #ec4899;
            color: white;
            padding: 6px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            box-shadow: 0 1px 4px rgba(0,0,0,0.3);
            white-space: nowrap;
            font-family: 'Inter', sans-serif;
            display: flex;
            align-items: center;
            gap: 4px;
          ">
            <span style="font-size: 12px;">📍</span>
            ${loc.name}
          </div>
        `;
      } else {
        labelHtml = `
          <div style="
            background: #ec4899;
            color: white;
            padding: 4px 8px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            white-space: nowrap;
            font-family: 'Inter', sans-serif;
          ">
            📍
          </div>
        `;
      }
      
      points.push({
        lat: loc.latitude,
        lng: loc.longitude,
        name: loc.name,
        zone: loc.zone || 'default',
        type: 'result',
        distance: item.distance,
        isHighlighted: !isExisting,
        label: labelHtml,
        size: isExisting ? (isZoomedIn ? 1.0 : 0.8) : (isZoomedIn ? 1.2 : 1.0),
        color: isExisting ? getZoneColor(loc.zone) : '#ec4899'
      });
    });

    globeInstanceRef.current.pointsData(points);
    globeInstanceRef.current.pointColor(point => point.color);
    globeInstanceRef.current.pointRadius(point => point.size);
    globeInstanceRef.current.pointLabel('label');
    globeInstanceRef.current.pointAltitude(0.05);

    const rings = results
      .filter(item => {
        const loc = item.point || item;
        return !locations.some(l => l._id === loc._id);
      })
      .map(item => {
        const loc = item.point || item;
        return {
          lat: loc.latitude,
          lng: loc.longitude,
          radius: 1.5,
          color: '#ec4899',
          propagationSpeed: 2,
          repeatPeriod: 1500
        };
      });
    
    globeInstanceRef.current.ringsData(rings);

  }, [locations, results, currentZoom]);

  // Detect new locations and zoom to them
  useEffect(() => {
    if (!globeInstanceRef.current) return;
    
    if (locations.length > lastLocationCount && locations.length > 0) {
      const newestLocation = locations[locations.length - 1];
      console.log("New location detected, zooming to:", newestLocation.name);
      
      globeInstanceRef.current.pointOfView({
        lat: newestLocation.latitude,
        lng: newestLocation.longitude,
        altitude: 0.3
      }, 1000);
      
      const tempRing = [{
        lat: newestLocation.latitude,
        lng: newestLocation.longitude,
        radius: 1.2,
        color: '#10b981',
        propagationSpeed: 3,
        repeatPeriod: 800
      }];
      
      globeInstanceRef.current.ringsData(tempRing);
      
      setTimeout(() => {
        if (globeInstanceRef.current) {
          const searchRings = results
            .filter(item => {
              const loc = item.point || item;
              return !locations.some(l => l._id === loc._id);
            })
            .map(item => {
              const loc = item.point || item;
              return {
                lat: loc.latitude,
                lng: loc.longitude,
                radius: 1.2,
                color: '#ec4899'
              };
            });
          globeInstanceRef.current.ringsData(searchRings);
        }
      }, 3000);
    }
    
    setLastLocationCount(locations.length);
  }, [locations, results, lastLocationCount]);

  // Click handler for points
  useEffect(() => {
    if (!globeInstanceRef.current) return;
    
    globeInstanceRef.current.onPointClick((point) => {
      console.log("Clicked on:", point.name);
      
      globeInstanceRef.current.pointOfView({
        lat: point.lat,
        lng: point.lng,
        altitude: 0.2
      }, 800);
    });
    
    // Hover handler
    globeInstanceRef.current.onPointHover((point) => {
      const tooltip = document.getElementById('globe-tooltip');
      if (tooltip && point) {
        tooltip.style.display = 'block';
        tooltip.innerHTML = `
          <strong>${point.name}</strong><br/>
          📍 Lat: ${point.lat.toFixed(4)}<br/>
          📍 Lng: ${point.lng.toFixed(4)}<br/>
          🏷️ ${point.zone || 'default'}
          ${point.distance ? `<br/>📏 ${point.distance.toFixed(2)} km away` : ''}
        `;
      } else if (tooltip) {
        tooltip.style.display = 'none';
      }
    });
    
  }, []);

  // Track mouse position for tooltip
  useEffect(() => {
    const handleMouseMove = (e) => {
      const tooltip = document.getElementById('globe-tooltip');
      if (tooltip && tooltip.style.display === 'block') {
        tooltip.style.left = `${e.clientX + 10}px`;
        tooltip.style.top = `${e.clientY - 30}px`;
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      <div 
        ref={globeRef} 
        className="globe-container"
        style={{ 
          width: '100%', 
          height: '100%',
          backgroundColor: '#000',
          position: 'relative'
        }} 
      />
      <div id="globe-tooltip" style={{
        position: 'fixed',
        display: 'none',
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(10px)',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '8px',
        fontSize: '12px',
        border: '1px solid rgba(99,102,241,0.3)',
        pointerEvents: 'none',
        zIndex: 1000,
        maxWidth: '250px',
        fontFamily: 'Inter, sans-serif',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }} />
    </>
  );
}

// Helper function to get different colors based on zone
function getZoneColor(zone) {
  const colors = {
    'default': '#6366f1',
    'north': '#3b82f6',
    'south': '#10b981',
    'east': '#f59e0b',
    'west': '#8b5cf6'
  };
  return colors[zone] || colors['default'];
}

export default GlobeView;