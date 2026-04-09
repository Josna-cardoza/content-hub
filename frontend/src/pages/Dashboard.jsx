import React from 'react';

export default function Dashboard() {
  return (
    <div className="glass-panel">
      <h2 style={{ color: 'var(--text-primary)', marginBottom: '20px' }}>Creator Dashboard</h2>
      <p style={{ color: 'var(--text-secondary)' }}>
        Welcome back! Here you can manage your articles, categories, and tags. 
        Real implementation will fetch data securely from the .NET Data Service via the Python API Gateway.
      </p>

      <div style={{ marginTop: '30px', display: 'flex', gap: '20px' }}>
        <div className="glass-panel" style={{ flex: 1, padding: '20px', background: 'rgba(30, 41, 59, 0.4)' }}>
          <h4>My Articles</h4>
          <h1 style={{ color: 'var(--accent-color)', marginTop: '10px' }}>12</h1>
        </div>
        <div className="glass-panel" style={{ flex: 1, padding: '20px', background: 'rgba(30, 41, 59, 0.4)' }}>
          <h4>Total Views</h4>
          <h1 style={{ color: 'var(--accent-color)', marginTop: '10px' }}>4,203</h1>
        </div>
        <div className="glass-panel" style={{ flex: 1, padding: '20px', background: 'rgba(30, 41, 59, 0.4)' }}>
          <h4>Followers</h4>
          <h1 style={{ color: 'var(--accent-color)', marginTop: '10px' }}>158</h1>
        </div>
      </div>
      
      <button className="btn-primary" style={{ marginTop: '30px' }}>+ Create New Article</button>
    </div>
  );
}
