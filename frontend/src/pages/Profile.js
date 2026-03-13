import React, { useEffect, useState } from 'react';
import API from '../utils/api';

const BRANCHES = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIML', 'DS'];

function SkillSlider({ label, name, value, onChange }) {
  const pct = ((value || 0) / 10) * 100;
  const color = pct >= 70 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="form-group">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label className="form-label">{label}</label>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{value || 0}/10</span>
      </div>
      <input type="range" min="0" max="10" step="0.5" value={value || 0}
        onChange={e => onChange(name, parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: color }} />
    </div>
  );
}

export default function Profile() {
  const [form, setForm] = useState({
    branch: 'CSE', cgpa: '', tenth_percentage: '', twelfth_percentage: '',
    programming_skill: 5, communication_skill: 5, problem_solving: 5,
    teamwork: 6, leadership: 5, internships: 0, projects: 0,
    certifications: 0, hackathons: 0, backlogs: 0
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('academic');

  useEffect(() => {
    API.get('/profile').then(r => {
      if (r.data.profile) {
        setForm(prev => ({ ...prev, ...r.data.profile }));
        setResult({
          placement_probability: r.data.profile.placement_probability,
          resume_score: r.data.profile.resume_score,
          suggestions: r.data.profile.suggestions,
        });
      }
    }).catch(console.error).finally(() => setLoadingProfile(false));
  }, []);

  const handleChange = (name, value) => setForm(prev => ({ ...prev, [name]: value }));
  const handleInput = (e) => handleChange(e.target.name, e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/profile', form);
      setResult(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Failed to save profile.');
    } finally { setLoading(false); }
  };

  const tabs = [
    { id: 'academic', label: '📚 Academic' },
    { id: 'skills', label: '💡 Skills' },
    { id: 'extras', label: '🏆 Extras' },
  ];

  if (loadingProfile) return <div style={{ padding: 28, display: 'flex', justifyContent: 'center', marginTop: 60 }}><div className="spinner" /></div>;

  return (
    <div className="content-area fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 className="section-title">My Profile</h1>
        <p className="section-sub">Fill in your details to get your AI placement prediction</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="tab-nav">
            {tabs.map(t => (
              <button key={t.id} type="button" className={`tab-btn${activeTab === t.id ? ' active' : ''}`}
                onClick={() => setActiveTab(t.id)}>{t.label}</button>
            ))}
          </div>

          {activeTab === 'academic' && (
            <div className="card fade-in">
              <div className="card-title">📚 Academic Details</div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Branch / Department</label>
                  <select className="form-select" name="branch" value={form.branch} onChange={handleInput}>
                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">CGPA (out of 10)</label>
                  <input className="form-input" type="number" name="cgpa" min="0" max="10" step="0.1"
                    placeholder="e.g. 7.5" value={form.cgpa} onChange={handleInput} required />
                </div>
                <div className="form-group">
                  <label className="form-label">10th Percentage</label>
                  <input className="form-input" type="number" name="tenth_percentage" min="0" max="100" step="0.1"
                    placeholder="e.g. 85" value={form.tenth_percentage} onChange={handleInput} />
                </div>
                <div className="form-group">
                  <label className="form-label">12th Percentage</label>
                  <input className="form-input" type="number" name="twelfth_percentage" min="0" max="100" step="0.1"
                    placeholder="e.g. 78" value={form.twelfth_percentage} onChange={handleInput} />
                </div>
                <div className="form-group">
                  <label className="form-label">Active Backlogs</label>
                  <input className="form-input" type="number" name="backlogs" min="0" max="10"
                    placeholder="0" value={form.backlogs} onChange={handleInput} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="card fade-in">
              <div className="card-title">💡 Rate Your Skills (0-10)</div>
              <div style={{ display: 'grid', gap: 8 }}>
                {[
                  { label: '💻 Programming / Coding', name: 'programming_skill' },
                  { label: '🗣️ Communication', name: 'communication_skill' },
                  { label: '🧩 Problem Solving', name: 'problem_solving' },
                  { label: '🤝 Teamwork', name: 'teamwork' },
                  { label: '👑 Leadership', name: 'leadership' },
                ].map(s => <SkillSlider key={s.name} {...s} value={form[s.name]} onChange={handleChange} />)}
              </div>
            </div>
          )}

          {activeTab === 'extras' && (
            <div className="card fade-in">
              <div className="card-title">🏆 Experience & Extras</div>
              <div className="form-grid">
                {[
                  { label: '🏢 Internships', name: 'internships', max: 5 },
                  { label: '💼 Projects', name: 'projects', max: 10 },
                  { label: '📜 Certifications', name: 'certifications', max: 10 },
                  { label: '🏅 Hackathons', name: 'hackathons', max: 10 },
                ].map(f => (
                  <div key={f.name} className="form-group">
                    <label className="form-label">{f.label}</label>
                    <input className="form-input" type="number" name={f.name} min="0" max={f.max}
                      value={form[f.name]} onChange={handleInput} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            {['academic', 'skills', 'extras'].indexOf(activeTab) > 0 && (
              <button type="button" className="btn btn-secondary" onClick={() => {
                const idx = ['academic', 'skills', 'extras'].indexOf(activeTab);
                setActiveTab(['academic', 'skills', 'extras'][idx - 1]);
              }}>← Back</button>
            )}
            {activeTab !== 'extras' ? (
              <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={() => {
                const idx = ['academic', 'skills', 'extras'].indexOf(activeTab);
                setActiveTab(['academic', 'skills', 'extras'][idx + 1]);
              }}>Next →</button>
            ) : (
              <button className="btn btn-primary" type="submit" disabled={loading} style={{ flex: 1 }}>
                {loading ? '⏳ Analyzing...' : '🤖 Predict My Placement'}
              </button>
            )}
          </div>
          {saved && <div className="alert alert-success" style={{ marginTop: 12 }}>✅ Profile saved & prediction updated!</div>}
        </form>

        {/* Result panel */}
        <div>
          {result ? (
            <div className="fade-in">
              <div className="card" style={{ marginBottom: 20, textAlign: 'center' }}>
                <div className="card-title" style={{ justifyContent: 'center' }}>🎯 Placement Prediction</div>
                <div style={{ margin: '12px auto' }}>
                  {(() => {
                    const prob = result.placement_probability || 0;
                    const color = prob >= 70 ? '#10b981' : prob >= 50 ? '#f59e0b' : '#ef4444';
                    const label = prob >= 70 ? 'High Chance' : prob >= 50 ? 'Moderate' : 'Needs Work';
                    return (
                      <>
                        <div style={{ fontSize: 52, fontWeight: 800, fontFamily: 'Space Grotesk', color }}>{prob.toFixed(1)}%</div>
                        <span className={`badge ${prob >= 70 ? 'badge-success' : prob >= 50 ? 'badge-warning' : 'badge-danger'}`}>{label}</span>
                      </>
                    );
                  })()}
                </div>
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                    <span style={{ color: 'var(--text2)' }}>Resume Score</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent3)' }}>{result.resume_score}/100</span>
                  </div>
                  <div className="skill-bar-track">
                    <div className="skill-bar-fill" style={{ width: `${result.resume_score}%`, background: 'linear-gradient(90deg, #6366f1, #06b6d4)' }} />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-title">⚡ Improvement Suggestions</div>
                {(result.suggestions || []).map((s, i) => (
                  <div key={i} className={`suggestion-item ${s.priority}`}>
                    <div className="suggestion-icon" style={{
                      background: s.priority === 'high' ? 'rgba(239,68,68,0.15)' : s.priority === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)'
                    }}>
                      {s.type === 'coding' ? '💻' : s.type === 'experience' ? '🏢' : s.type === 'academic' ? '📚' : s.type === 'certification' ? '🏆' : s.type === 'communication' ? '🗣️' : '📄'}
                    </div>
                    <div>
                      <div className="suggestion-title">{s.message}</div>
                      <div className="suggestion-action">→ {s.action}</div>
                      <span className={`badge badge-${s.priority === 'high' ? 'danger' : s.priority === 'medium' ? 'warning' : 'success'}`} style={{ marginTop: 6 }}>
                        {s.priority} priority
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
              <p style={{ color: 'var(--text2)' }}>Fill in your profile and click "Predict My Placement" to get your AI-powered analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
