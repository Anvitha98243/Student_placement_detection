import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      {/* Aurora blobs */}
      <div className="auth-aurora-blob" style={{ width: 500, height: 500, background: '#a5f3c8', opacity: 0.5, top: -150, left: -100 }} />
      <div className="auth-aurora-blob" style={{ width: 400, height: 400, background: '#c7bbff', opacity: 0.5, top: 100, left: '30%' }} />
      <div className="auth-aurora-blob" style={{ width: 350, height: 350, background: '#fda4af', opacity: 0.45, bottom: -80, right: -60 }} />
      <div className="auth-aurora-blob" style={{ width: 280, height: 280, background: '#67e8f9', opacity: 0.4, bottom: 0, left: '20%' }} />

      <div className="auth-left">
        <div style={{ textAlign: 'center', maxWidth: 460 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20, background: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, margin: '0 auto 24px',
            boxShadow: '0 8px 32px rgba(80,60,180,0.15)'
          }}>🎯</div>

          <h1 style={{
            fontFamily: 'Syne, sans-serif', fontSize: 44, fontWeight: 800,
            color: '#1a1a2e', marginBottom: 14, lineHeight: 1.1
          }}>
            Predict Your<br />Placement
          </h1>
          <p style={{ color: 'rgba(13,13,26,0.6)', fontSize: 17, lineHeight: 1.7, marginBottom: 40 }}>
            AI-powered student placement prediction. Know your chances, improve your skills, land your dream job.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[['86.5%', 'Model Accuracy'], ['5000+', 'Data Points'], ['10+', 'Skill Metrics']].map(([val, label]) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.85)', borderRadius: 14,
                padding: '16px 22px', textAlign: 'center',
                boxShadow: '0 4px 16px rgba(80,60,180,0.1)'
              }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, color: '#1a1a2e' }}>{val}</div>
                <div style={{ fontSize: 12, color: 'rgba(13,13,26,0.5)', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form fade-in">
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Sign in to your placement dashboard</p>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@college.edu" required
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••" required
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Signing in…' : '🚀 Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text2)', fontSize: 14 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}