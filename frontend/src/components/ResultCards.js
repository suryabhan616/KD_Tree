import React from 'react';

function ResultCards({ results, type }) {
    if (results.length === 0) {
        return (
            <div className="results-panel">
                <h3 style={{
                    color: '#6366f1',
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '15px'
                }}>
                    Query Results
                </h3>
                <div style={{
                    textAlign: 'center',
                    padding: '40px 20px'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.3 }}>📍</div>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                        Run a query to see results here
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="results-panel">
            <h3 style={{
                color: '#6366f1',
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '15px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span>{type === 'nearest' ? '🎯 Nearest Locations' : '📊 Range Results'}</span>
                <span style={{
                    background: 'rgba(99,102,241,0.2)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.7rem'
                }}>
                    {results.length} found
                </span>
            </h3>

            {results.map((item, index) => {
                const loc = item.point || item;
                return (
                    <div key={index} className="result-card">
                        <h4>
                            <span style={{ color: '#64748b', marginRight: '8px' }}>
                                #{index + 1}
                            </span>
                            {loc.name}
                        </h4>
                        <p>
                            📍 {loc.latitude}, {loc.longitude}
                        </p>
                        <div>
                            <span className="zone-badge">
                                🏷️ {loc.zone || 'default'}
                            </span>
                            {item.distance && (
                                <span className="distance-badge">
                                    📏 {item.distance.toFixed(2)} km
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