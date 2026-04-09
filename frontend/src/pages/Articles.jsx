import React, { useEffect, useState } from 'react';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // First try the robust proxy route which docker will have. For dev without proxy we try localhost:8000
    fetch('/api/articles')
      .then(res => {
        if (!res.ok) {
          throw new Error('Local origin fetch failed');
        }
        return res.json();
      })
      .catch(() => {
         // Fallback to absolute localhost for local dev if CORS allows and proxy isn't there
         return fetch('http://localhost:8000/api/articles').then(r => {
             if(!r.ok) throw new Error('API fetch failed');
             return r.json();
         });
      })
      .then(data => {
        // Backend returns the data or deeply nested data, .NET is returning list directly.
        setArticles(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load articles');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="hero-section"><h2>Loading articles...</h2></div>;
  if (error) return <div className="hero-section"><h2>{error}</h2></div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', textAlign: 'center', fontSize: '2.5rem', color: 'var(--text-primary)' }}>
        Latest Articles
      </h1>
      {articles.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No articles found.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {articles.map(article => (
            <div key={article.id} style={{ 
              background: 'var(--bg-secondary)', 
              borderRadius: '12px', 
              overflow: 'hidden',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              display: 'flex',
              flexDirection: 'column'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}>
              {article.imageUrl && (
                <img 
                  src={article.imageUrl} 
                  alt={article.title} 
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }} 
                />
              )}
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  {article.title}
                </h3>
                {article.author && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--accent-color)', marginBottom: '1rem', fontWeight: 600 }}>By {article.author.fullName}</p>
                )}
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1 }}>{article.summary}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                  <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                  <button style={{
                    background: 'var(--accent-color)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'background 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                  onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
                  >Read More</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Articles;
