import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Account from './pages/Account';
import CreateArticle from './pages/CreateArticle';
import EditArticle from './pages/EditArticle';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import Login from './pages/Login';
import UserDropdown from './components/UserDropdown';
import { googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import './index.css';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    googleLogout();
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <BrowserRouter>
      <nav className="navbar">
        <div className="nav-brand">Atklhub</div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/articles">Articles</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact</Link>
          {user ? (
            <UserDropdown user={user} onLogout={handleLogout} />
          ) : (
            <Link to="/login" className="login-nav-btn">
              Sign In
            </Link>
          )}
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/account" element={<Account user={user} onUpdateUser={setUser} />} />
          <Route path="/create-article" element={<CreateArticle user={user} />} />
          <Route path="/edit-article/:id" element={<EditArticle user={user} />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/:id" element={<ArticleDetail user={user} />} />
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        </Routes>
      </main>

      <footer className="footer">
        © 2026 Atklhub. All rights reserved.
      </footer>
    </BrowserRouter>
  );
}

export default App;
