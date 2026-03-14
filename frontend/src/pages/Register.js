import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try {
      await register(form.name, form.email, form.password);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-aurora-blob" style={{ width: 500, height: 500, background: '#b8f0c8', opacity: 0.55, top: -150, left: -80 }} />
      <div className="auth-aurora-blob" style={{ width: 380, height: 380, background: '#c7bbff', opacity: 0.5, top: 80, left: '35%' }} />
      <div className="auth-aurora-blob" style={{ width: 320, height: 320, background: '#fda4af', opacity: 0.4, bottom: -60, right: -40 }} />
      <div className="auth-aurora-blob" style={{ width: 260, height: 260, background: '#67e8f9', opacity: 0.4, bottom: 60, left: '15%' }} />

      <div className="auth-left">
        <div style={{ textAlign: 'center', maxWidth: 440 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20, background: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, margin: '0 auto 24px', boxShadow: '0 8px 32px rgba(80,60,180,0.15)'
          }}>🚀</div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 40, fontWeight: 800, color: '#1a1a2e', marginBottom: 14, lineHeight: 1.1 }}>
            Start Your<br />Journey
          </h1>
          <p style={{ color: 'rgba(13,13,26,0.6)', fontSize: 16, lineHeight: 1.7, marginBottom: 40 }}>
            Get AI-powered insights on your placement readiness. Take tests, improve your skills, land your dream job.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320, margin: '0 auto' }}>
            {['📊 ML-Powered Placement Prediction', '💻 Coding & Aptitude Tests', '🎯 Personalised Improvement Tips', '📚 Curated Learning Resources'].map(f => (
              <div key={f} style={{
                display: 'flex', alignItems: 'center', gap: 12, fontSize: 14,
                background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.8)', borderRadius: 10,
                padding: '10px 16px', color: 'rgba(13,13,26,0.7)'
              }}>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form fade-in">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join thousands of students preparing for placements</p>
          {error && <div className="alert alert-error">⚠️ {error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="John Doe" required
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">College Email</label>
              <input className="form-input" type="email" placeholder="john@college.edu" required
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Min 6 characters" required
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Confirm Password</label>
              <input className="form-input" type="password" placeholder="Repeat password" required
                value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} />
            </div>
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Creating account…' : '✨ Create Account'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text2)', fontSize: 14 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}