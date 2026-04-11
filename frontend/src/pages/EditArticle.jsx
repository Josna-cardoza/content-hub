import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditArticle = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editableRef = useRef(null);

  const [formData, setFormData] = useState({
    id: parseInt(id),
    title: '',
    summary: '',
    content: '',
    imageUrl: '',
    slug: '',
    status: 'Draft',
  });
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/articles/${id}`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        if (!res.ok) throw new Error('Failed to load article');
        const data = await res.json();
        setFormData({
          id: data.id,
          title: data.title || '',
          summary: data.summary || '',
          content: data.content || '',
          imageUrl: data.imageUrl || '',
          slug: data.slug || '',
          status: data.status || 'Draft',
        });
        // Set editable div content
        if (editableRef.current) {
          editableRef.current.innerHTML = data.content || '';
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  // Sync editable div after load
  useEffect(() => {
    if (!loading && editableRef.current && formData.content) {
      editableRef.current.innerHTML = formData.content;
    }
  }, [loading]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContentChange = () => {
    if (editableRef.current) {
      setFormData((prev) => ({ ...prev, content: editableRef.current.innerHTML }));
    }
  };

  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editableRef.current?.focus();
    handleContentChange();
  };

  const handleSave = async (e, finalStatus) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = { ...formData, status: finalStatus };

    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        navigate('/dashboard');
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update article');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading article...</div>;

  return (
    <div style={{ maxWidth: isFullScreen ? '100%' : '1000px', margin: '0 auto', padding: isFullScreen ? '0' : '2rem' }}>
      <div style={isFullScreen ? {
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        zIndex: 9999, background: 'var(--bg-primary)', padding: '2rem',
        display: 'flex', flexDirection: 'column', overflowY: 'auto'
      } : {}}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', maxWidth: '1000px', margin: '0 auto 1.5rem auto', width: '100%' }}>
          <h1 style={{ fontSize: isFullScreen ? '1.5rem' : '2.5rem' }}>
            {isFullScreen ? 'Focus Editor' : 'Edit Article'}
          </h1>
          {isFullScreen && (
            <button onClick={() => setIsFullScreen(false)}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
              Exit Full Screen
            </button>
          )}
        </div>

        <form onSubmit={(e) => e.preventDefault()} style={{
          display: 'flex', flexDirection: 'column', gap: '1.5rem',
          width: '100%', maxWidth: '1000px', margin: '0 auto', flex: isFullScreen ? 1 : 'none'
        }}>
          {!isFullScreen && (
            <>
              <input type="text" name="title" placeholder="Article Title" required
                value={formData.title} onChange={handleChange} style={inputStyle} />
              <input type="text" name="imageUrl" placeholder="Featured Image URL"
                value={formData.imageUrl} onChange={handleChange} style={inputStyle} />
              <textarea name="summary" placeholder="Brief Summary" required
                value={formData.summary} onChange={handleChange}
                style={{ ...inputStyle, minHeight: '80px', resize: 'none' }} />
            </>
          )}

          {/* Editor */}
          <div style={{
            position: 'relative', borderRadius: '12px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)',
            display: 'flex', flexDirection: 'column',
            flex: isFullScreen ? 1 : 'none', minHeight: isFullScreen ? '0' : '500px'
          }}>
            {/* Toolbar */}
            <div style={{
              padding: '12px', borderBottom: '1px solid var(--glass-border)',
              display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.02)',
              borderTopLeftRadius: '12px', borderTopRightRadius: '12px'
            }}>
              <button type="button" onClick={() => applyFormat('bold')} style={toolbarBtn} title="Bold"><b>B</b></button>
              <button type="button" onClick={() => applyFormat('italic')} style={toolbarBtn} title="Italic"><i>I</i></button>
              <button type="button" onClick={() => applyFormat('formatBlock', 'H1')} style={toolbarBtn}>H1</button>
              <button type="button" onClick={() => applyFormat('formatBlock', 'H2')} style={toolbarBtn}>H2</button>
              <button type="button" onClick={() => applyFormat('insertUnorderedList')} style={toolbarBtn}>•</button>
              <button type="button" onClick={() => applyFormat('formatBlock', 'BLOCKQUOTE')} style={toolbarBtn}>"</button>
              <div style={{ flex: 1 }} />
              <button type="button" onClick={() => setIsFullScreen(!isFullScreen)}
                style={{ ...toolbarBtn, background: 'rgba(59,130,246,0.2)', color: 'var(--accent-color)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              </button>
            </div>

            <div ref={editableRef} contentEditable onInput={handleContentChange}
              style={{
                width: '100%', flex: 1, padding: '30px', background: 'transparent',
                color: 'var(--text-primary)', fontSize: '1.2rem', lineHeight: '1.8',
                outline: 'none', minHeight: '200px', overflowY: 'auto'
              }}
              placeholder="Write your article here..."
            />
          </div>

          {error && <div style={{ color: '#f44336', textAlign: 'center' }}>{error}</div>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: isFullScreen ? '1rem' : '0' }}>
            <button type="button" onClick={(e) => handleSave(e, 'Draft')} disabled={saving}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                color: 'var(--text-secondary)', padding: '12px 30px', borderRadius: '8px',
                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
              }}>
              Save as Draft
            </button>
            <button type="button" onClick={(e) => handleSave(e, 'Published')} disabled={saving}
              className="btn-primary" style={{ padding: '12px 40px' }}>
              {saving ? 'Saving...' : 'Publish Article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%', padding: '14px', borderRadius: '10px',
  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
  color: 'var(--text-primary)', fontSize: '1rem',
};

const toolbarBtn = {
  width: '38px', height: '38px', display: 'flex', alignItems: 'center',
  justifyContent: 'center', background: 'rgba(255,255,255,0.06)', border: 'none',
  borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer',
  fontSize: '1rem', transition: 'all 0.2s',
};

export default EditArticle;
