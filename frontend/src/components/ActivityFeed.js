import React from 'react';

function ActivityFeed({ activities }) {
    return (
        <div className="activity-feed">
            <div className="activity-scroll">
                <span className="live-badge">● LIVE</span>
                {activities.length === 0 ? (
                    <span>No activity yet — run a query</span>
                ) : (
                    activities.map((activity, index) => (
                        <span key={index}>✦ {activity}</span>
                    ))
                )}
            </div>
        </div>
    );
}

export default ActivityFeed;