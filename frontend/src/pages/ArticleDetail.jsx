import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CommentSection from '../components/CommentSection';

const ArticleDetail = ({ user }) => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/articles/${id}`);
        if (!res.ok) throw new Error('Article not found');
        const data = await res.json();
        setArticle(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  if (loading) return <div className="hero-section"><h2>Loading Article...</h2></div>;
  if (error) return <div className="hero-section"><h2>{error}</h2><Link to="/articles" style={{color: 'var(--accent-color)'}}>Back to Articles</Link></div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/articles" style={{ color: 'var(--text-tertiary)', textDecoration: 'none', marginBottom: '2rem', display: 'inline-block' }}>
        ← Back to Articles
      </Link>
      
      <article>
        {article.imageUrl && (
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '12px', marginBottom: '2rem' }} 
          />
        )}
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: '1.2' }}>{article.title}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
          {article.author && <span>By <strong>{article.author.fullName}</strong></span>}
          <span>•</span>
          <span>{new Date(article.createdAt).toLocaleDateString()}</span>
        </div>
        
        <div 
          style={{ fontSize: '1.2rem', lineHeight: '1.8', color: 'var(--text-primary)' }}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>

      <CommentSection articleId={id} user={user} />
    </div>
  );
};

export default ArticleDetail;
