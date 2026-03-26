import React, { useEffect, useRef } from 'react';

function ActivityFeed({ activities }) {
    const feedRef = useRef(null);

    useEffect(() => {
        if (feedRef.current) {
            feedRef.current.scrollLeft = feedRef.current.scrollWidth;
        }
    }, [activities]);

    return (
        <div className="activity-feed" ref={feedRef}>
            <span style={{
                color: '#3b82f6',
                fontWeight: '700',
                marginRight: '15px',
                fontSize: '0.8rem',
                whiteSpace: 'nowrap'
            }}>
                LIVE
            </span>
            {activities.length === 0 ? (
                <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                    No activity yet — add a location or run a query
                </span>
            ) : (
                activities.map((activity, index) => (
                    <span key={index} style={{
                        color: '#94a3b8',
                        fontSize: '0.8rem',
                        whiteSpace: 'nowrap',
                        marginRight: '30px'
                    }}>
                        ✦ {activity}
                    </span>
                ))
            )}
        </div>
    );
}

export default ActivityFeed;