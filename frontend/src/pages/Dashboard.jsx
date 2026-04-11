import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = ({ user }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  const fetchMyArticles = async () => {
    try {
      const res = await fetch('/api/articles/my-content', {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      }
    } catch (err) {
      console.error('Failed to fetch user content', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchMyArticles();
  }, [user]);

  const handleDelete = async (articleId) => {
    if (!window.confirm('Are you sure you want to delete this article? This cannot be undone.')) return;
    setDeletingId(articleId);
    try {
      const res = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (res.ok || res.status === 204) {
        setArticles((prev) => prev.filter((a) => a.id !== articleId));
      } else {
        alert('Failed to delete article. Please try again.');
      }
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete article.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredArticles = articles.filter((article) => {
    if (filter === 'All') return true;
    return article.status === filter;
  });

  if (!user) return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      Please log in to view your dashboard.
    </div>
  );

  return (
    <div className="dashboard-container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Creator Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {user.name || user.email}</p>
        </div>
        <Link to="/create-article" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Article
        </Link>
      </header>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
        {['All', 'Draft', 'Published'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              background: 'none', border: 'none',
              color: filter === tab ? 'var(--accent-color)' : 'var(--text-secondary)',
              fontWeight: 600, fontSize: '1rem', cursor: 'pointer',
              position: 'relative', padding: '4px 8px'
            }}
          >
            {tab === 'All' ? 'All Content' : tab}
            {filter === tab && (
              <div style={{
                position: 'absolute', bottom: '-17px', left: 0,
                width: '100%', height: '3px',
                background: 'var(--accent-color)', borderRadius: '3px'
              }} />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading your content...</div>
      ) : (
        <div className="content-manager">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {filteredArticles.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                <p style={{ color: 'var(--text-tertiary)', marginBottom: '1.5rem' }}>
                  No {filter === 'All' ? '' : filter.toLowerCase() + ' '}articles found.
                </p>
                {filter === 'All' && (
                  <Link to="/create-article" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>
                    Start your first draft →
                  </Link>
                )}
              </div>
            ) : (
              filteredArticles.map((article) => (
                <div key={article.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                      background: article.status === 'Published' ? 'rgba(76,175,80,0.1)' : 'rgba(255,152,0,0.1)',
                      color: article.status === 'Published' ? '#4caf50' : '#ff9800'
                    }}>
                      {(article.status || 'Draft').toUpperCase()}
                    </span>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                      {new Date(article.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ margin: 0 }}>{article.title}</h3>
                  <p style={{
                    fontSize: '0.9rem', color: 'var(--text-secondary)',
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>
                    {article.summary}
                  </p>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', alignItems: 'center' }}>
                    <Link to={`/articles/${article.id}`} style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--accent-color)' }}>
                      View
                    </Link>
                    <button
                      onClick={() => navigate(`/edit-article/${article.id}`)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      disabled={deletingId === article.id}
                      style={{
                        background: 'none', border: 'none', color: deletingId === article.id ? 'var(--text-tertiary)' : '#ff4444',
                        fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', marginLeft: 'auto'
                      }}
                    >
                      {deletingId === article.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
