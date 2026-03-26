import React from 'react';

function ResultCards({ results, type }) {
    if (results.length === 0) {
        return (
            <div className="results-panel">
                <h3 style={{
                    color: '#3b82f6',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '15px'
                }}>
                    Query Results
                </h3>
                <div style={{
                    color: '#64748b',
                    fontSize: '0.85rem',
                    textAlign: 'center',
                    marginTop: '40px'
                }}>
                    Run a query to see results here
                </div>
            </div>
        );
    }

    return (
        <div className="results-panel">
            <h3 style={{
                color: '#3b82f6',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '15px'
            }}>
                {type === 'nearest' ? 'Nearest Locations' : 'Range Results'}
                <span style={{
                    marginLeft: '8px',
                    background: 'rgba(59,130,246,0.2)',
                    border: '1px solid #3b82f6',
                    borderRadius: '20px',
                    padding: '2px 8px',
                    fontSize: '0.75rem'
                }}>
                    {results.length} found
                </span>
            </h3>

            {results.map((item, index) => {
                const loc = item.point || item;
                return (
                    <div className="result-card" key={index}>
                        <h4>
                            <span style={{ color: '#64748b', marginRight: '8px' }}>
                                #{index + 1}
                            </span>
                            {loc.name}
                        </h4>
                        <p>Lat: {loc.latitude}</p>
                        <p>Lon: {loc.longitude}</p>
                        <div>
                            <span className="zone-badge">{loc.zone}</span>
                            {item.distance && (
                                <span className="distance-badge">
                                    {item.distance.toFixed(2)} km
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default ResultCards;