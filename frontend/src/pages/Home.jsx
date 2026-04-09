import React from 'react';

export default function Home() {
  return (
    <>
      <section className="hero-section">
        <h1 className="hero-title">Discover Modular Content</h1>
        <p className="hero-subtitle">
          Explore highly curated articles, papers, and blogs powered by a robust backend and an ultra-fast frontend.
        </p>
        <button className="btn-primary">Get Started</button>
      </section>

      <section className="articles-grid">
        <div className="glass-panel">
          <h3>Understanding Next-Gen Patterns</h3>
          <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>
            A deep dive into architecture and microservices in 2026.
          </p>
        </div>
        <div className="glass-panel">
          <h3>React Vite with .NET Core</h3>
          <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>
            How to seamlessly bridge your React frontend with a robust backend.
          </p>
        </div>
        <div className="glass-panel">
          <h3>Premium Web Design Aesthetics</h3>
          <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>
            Implementing glassmorphism and modern CSS dynamically.
          </p>
        </div>
      </section>
    </>
  );
}
