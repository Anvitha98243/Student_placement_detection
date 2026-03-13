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
      <div className="auth-left">
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{ fontSize: 80, marginBottom: 24 }}>🎯</div>
          <h1 style={{ fontSize: 40, fontWeight: 800, fontFamily: 'Space Grotesk', marginBottom: 16,
            background: 'linear-gradient(135deg, #fff, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            PlaceAI
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 18, maxWidth: 400, lineHeight: 1.6 }}>
            AI-powered student placement prediction system. Know your chances. Improve your skills. Land your dream job.
          </p>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 40 }}>
            {[['86.5%', 'Model Accuracy'], ['5000+', 'Data Points'], ['10+', 'Skill Metrics']].map(([val, label]) => (
              <div key={label} style={{ textAlign: 'center', background: 'rgba(99,102,241,0.1)', padding: '16px 24px', borderRadius: 12, border: '1px solid rgba(99,102,241,0.2)' }}>
                <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Space Grotesk', color: '#a5b4fc' }}>{val}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{label}</div>
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
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••" required
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Signing in...' : '🚀 Sign In'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text2)', fontSize: 14 }}>
            Don't have an account? <Link to="/register" style={{ color: '#a5b4fc' }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
