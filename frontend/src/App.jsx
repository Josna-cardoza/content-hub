import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Articles from './pages/Articles';
import './index.css';

function App() {
  const [isLogged, setIsLogged] = useState(false);

  return (
    <BrowserRouter>
      <nav className="navbar">
        <div className="nav-brand">Atklhub</div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/articles">Articles</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact</Link>
          {isLogged ? (
            <>
              <Link to="/dashboard" style={{ color: 'var(--accent-color)' }}>Dashboard</Link>
              <button 
                onClick={() => setIsLogged(false)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}
              >
                Logout
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsLogged(true)} 
              style={{ background: 'transparent', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', cursor: 'pointer', padding: '4px 12px', borderRadius: '4px', fontWeight: 600, fontSize: '0.9rem' }}
            >
              Login (Mock)
            </button>
          )}
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/articles" element={<Articles />} />
        </Routes>
      </main>

      <footer className="footer">
        © 2026 Atklhub. All rights reserved.
      </footer>
    </BrowserRouter>
  );
}

export default App;
