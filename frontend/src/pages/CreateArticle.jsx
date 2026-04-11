import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateArticle = ({ user }) => {
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    imageUrl: '',
    status: 'Draft' 
  });
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const editableRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContentChange = () => {
    const html = editableRef.current.innerHTML;
    setFormData({ ...formData, content: html });
  };

  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editableRef.current.focus();
    handleContentChange();
  };

  const handleSubmit = async (e, finalStatus = 'Draft') => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const submissionData = { ...formData, status: finalStatus };

    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(submissionData)
      });

      if (res.ok) {
        navigate('/dashboard');
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Failed to save article');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fullScreenStyles = isFullScreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 9999,
    background: 'var(--bg-primary)',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto'
  } : {};

  return (
    <div className="create-article-page" style={{ maxWidth: isFullScreen ? '100%' : '1000px', margin: '0 auto', padding: isFullScreen ? '0' : '2rem' }}>
      <div style={fullScreenStyles}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', width: '100%', maxWidth: '1000px', margin: '0 auto 1.5rem auto' }}>
          <h1 style={{ fontSize: isFullScreen ? '1.5rem' : '2.5rem' }}>{isFullScreen ? 'Focus Editor' : 'Create New Article'}</h1>
          {isFullScreen && (
            <button 
              onClick={() => setIsFullScreen(false)}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
            >
              Exit Full Screen
            </button>
          )}
        </div>

        <form onSubmit={(e) => e.preventDefault()} style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.5rem', 
          width: '100%', 
          maxWidth: '1000px', 
          margin: '0 auto', 
          flex: isFullScreen ? 1 : 'none'
        }}>
          {!isFullScreen && (
            <>
              <input 
                type="text" 
                name="title" 
                placeholder="Article Title" 
                required 
                value={formData.title}
                onChange={handleChange}
                style={inputStyle}
              />
              <input 
                type="text" 
                name="imageUrl" 
                placeholder="Featured Image URL" 
                value={formData.imageUrl}
                onChange={handleChange}
                style={inputStyle}
              />
              <textarea 
                name="summary" 
                placeholder="Brief Summary" 
                required 
                value={formData.summary}
                onChange={handleChange}
                style={{ ...inputStyle, minHeight: '80px', resize: 'none' }}
              />
            </>
          )}

          <div style={{ 
            position: 'relative', 
            borderRadius: '12px', 
            background: 'rgba(255,255,255,0.03)', 
            border: '1px solid var(--glass-border)',
            display: 'flex',
            flexDirection: 'column',
            flex: isFullScreen ? 1 : 'none',
            minHeight: isFullScreen ? '0' : '500px'
          }}>
            {/* Toolbar */}
            <div style={{ 
              padding: '12px', 
              borderBottom: '1px solid var(--glass-border)', 
              display: 'flex', 
              gap: '10px', 
              background: 'rgba(255,255,255,0.02)',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px'
            }}>
              <button type="button" onClick={() => applyFormat('bold')} style={toolbarBtn} title="Bold"><b>B</b></button>
              <button type="button" onClick={() => applyFormat('italic')} style={toolbarBtn} title="Italic"><i>I</i></button>
              <button type="button" onClick={() => applyFormat('formatBlock', 'H1')} style={toolbarBtn} title="H1">H1</button>
              <button type="button" onClick={() => applyFormat('formatBlock', 'H2')} style={toolbarBtn} title="H2">H2</button>
              <button type="button" onClick={() => applyFormat('insertUnorderedList')} style={toolbarBtn} title="List">•</button>
              <button type="button" onClick={() => applyFormat('formatBlock', 'BLOCKQUOTE')} style={toolbarBtn} title="Quote">"</button>
              
              <div style={{ flex: 1 }}></div>

              <button 
                type="button" 
                onClick={() => setIsFullScreen(!isFullScreen)} 
                style={{ ...toolbarBtn, background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-color)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                </svg>
              </button>
            </div>

            <div 
              ref={editableRef}
              contentEditable
              onInput={handleContentChange}
              style={{ 
                width: '100%',
                flex: 1,
                padding: '30px',
                background: 'transparent',
                color: 'var(--text-primary)',
                fontSize: '1.2rem',
                lineHeight: '1.8',
                outline: 'none',
                minHeight: '200px',
                overflowY: 'auto'
              }}
              placeholder="Write your article here..."
            />
          </div>

          {error && <div style={{ color: '#f44336', textAlign: 'center' }}>{error}</div>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: isFullScreen ? '1rem' : '0' }}>
            <button 
              type="button" 
              onClick={(e) => handleSubmit(e, 'Draft')}
              disabled={loading}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-secondary)',
                padding: '12px 30px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Save as Draft
            </button>
            <button 
              type="button" 
              onClick={(e) => handleSubmit(e, 'Published')}
              disabled={loading}
              className="btn-primary"
              style={{ padding: '12px 40px' }}
            >
              {loading ? 'Processing...' : 'Publish Article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '14px',
  borderRadius: '10px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--glass-border)',
  color: 'var(--text-primary)',
  fontSize: '1rem',
};

const toolbarBtn = {
  width: '38px',
  height: '38px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(255,255,255,0.06)',
  border: 'none',
  borderRadius: '8px',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  fontSize: '1rem',
  transition: 'all 0.2s',
};

export default CreateArticle;
