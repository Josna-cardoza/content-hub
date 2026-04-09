import React from 'react';

export default function Contact() {
  return (
    <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{ marginBottom: '20px', color: 'var(--accent-color)' }}>Contact Us</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
        Have questions or want to become a creator? Reach out to us.
      </p>
      
      <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="email" 
          placeholder="Your Email" 
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} 
        />
        <textarea 
          placeholder="Message" 
          rows="5"
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} 
        ></textarea>
        <button type="button" className="btn-primary" style={{ marginTop: '10px' }}>Send Message</button>
      </form>
    </div>
  );
}
