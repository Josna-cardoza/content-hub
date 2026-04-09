import React from 'react';

export default function About() {
  return (
    <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
      <h2 style={{ marginBottom: '20px', color: 'var(--accent-color)' }}>About Us</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
        We are a passionate platform aiming to deliver the highest quality structural content, architectural insights, and articles across the tech community. Our platform is built on modern decoupled technologies ensuring extreme velocity and scalability.
      </p>
    </div>
  );
}
