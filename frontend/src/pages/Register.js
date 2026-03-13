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
      <div className="auth-left">
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{ fontSize: 80, marginBottom: 24 }}>🚀</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, fontFamily: 'Space Grotesk', marginBottom: 16,
            background: 'linear-gradient(135deg, #fff, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Start Your Journey
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 16, maxWidth: 380, lineHeight: 1.7 }}>
            Get AI-powered insights on your placement readiness. Take tests, improve skills, and land your dream job.
          </p>
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320, margin: '40px auto 0' }}>
            {['📊 ML-Powered Placement Prediction', '💻 Coding & Aptitude Tests', '🎯 Personalized Improvement Tips', '📚 Curated Learning Resources'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text2)' }}>
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
                value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">College Email</label>
              <input className="form-input" type="email" placeholder="john@college.edu" required
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Min 6 characters" required
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Confirm Password</label>
              <input className="form-input" type="password" placeholder="Repeat password" required
                value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} />
            </div>
            <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Creating account...' : '✨ Create Account'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text2)', fontSize: 14 }}>
            Already have an account? <Link to="/login" style={{ color: '#a5b4fc' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
