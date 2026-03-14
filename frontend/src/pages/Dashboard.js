import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import API from '../utils/api';
import { useAuth } from '../utils/AuthContext';

function ProbCircle({ value }) {
  const radius = 56, circ = 2 * Math.PI * radius;
  const pct = Math.min(100, Math.max(0, value || 0));
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 70 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="prob-circle-wrap">
      <div className="prob-circle">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="#1a2540" strokeWidth="10" />
          <circle cx="70" cy="70" r={radius} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.5s ease' }} />
        </svg>
        <div className="prob-value" style={{ color }}>
          {pct.toFixed(1)}%
          <span>Placement</span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/dashboard/stats').then(r => setStats(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 28, display: 'flex', justifyContent: 'center', marginTop: 60 }}><div className="spinner" /></div>;

  if (!stats?.has_profile) return (
    <div className="content-area fade-in">
      <div style={{ maxWidth: 540, margin: '60px auto', textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 20 }}>👋</div>
        <h2 style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Space Grotesk', marginBottom: 12 }}>Welcome, {user?.name}!</h2>
        <p style={{ color: 'var(--text2)', marginBottom: 32, fontSize: 16, lineHeight: 1.6 }}>
          Let's get started by setting up your profile. Our AI will analyze your details and predict your placement chances.
        </p>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/profile')}>
          🚀 Setup My Profile
        </button>
      </div>
    </div>
  );

  const radarData = stats.skills ? [
    { skill: 'Programming', value: (stats.skills.programming || 0) * 10 },
    { skill: 'Communication', value: (stats.skills.communication || 0) * 10 },
    { skill: 'Problem Solving', value: (stats.skills.problem_solving || 0) * 10 },
    { skill: 'Teamwork', value: (stats.skills.teamwork || 0) * 10 },
    { skill: 'Leadership', value: (stats.skills.leadership || 0) * 10 },
  ] : [];

  const testData = stats.test_history ? Object.entries(stats.test_history).map(([type, scores]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    score: scores[scores.length - 1] || 0
  })) : [];

  const prioritySugg = (stats.suggestions || []).filter(s => s.priority === 'high').slice(0, 2);

  return (
    <div className="content-area fade-in">
      <div className="top-bar" style={{ background: 'transparent', border: 'none', padding: '0 0 20px 0', position: 'static' }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>Welcome back, {user?.name} 👋</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/profile')}>Update Profile</button>
      </div>

      {/* Stats row */}
      <div className="stats-grid">
        {[
          { label: 'Placement Chance', value: `${(stats.placement_probability || 0).toFixed(1)}%`, icon: '🎯', color: 'blue' },
          { label: 'Resume Score', value: `${stats.resume_score || 0}/100`, icon: '📄', color: 'green' },
          { label: 'Tests Taken', value: stats.total_tests_taken || 0, icon: '📝', color: 'purple' },
          { label: 'CGPA', value: stats.academics?.cgpa || '—', icon: '🏫', color: 'orange' },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Placement probability */}
        <div className="card">
          <div className="card-title">🎯 Placement Prediction</div>
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <ProbCircle value={stats.placement_probability} />
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 12 }}>
                {[
                  { label: 'CGPA', val: `${stats.academics?.cgpa || 0}/10` },
                  { label: 'Internships', val: stats.extras?.internships || 0 },
                  { label: 'Projects', val: stats.extras?.projects || 0 },
                  { label: 'Certifications', val: stats.extras?.certifications || 0 },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                    <span style={{ color: 'var(--text2)' }}>{item.label}</span>
                    <span style={{ fontWeight: 600 }}>{item.val}</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/profile')} style={{ width: '100%' }}>Improve Score</button>
            </div>
          </div>
        </div>

        {/* Skills radar */}
        <div className="card">
          <div className="card-title">💡 Skills Overview</div>
          {radarData.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <ResponsiveContainer width="100%" height={stats.lsrw_breakdown ? 180 : 200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(99,102,241,0.2)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Radar name="Skills" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
              {stats.lsrw_breakdown && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 'auto', padding: '10px 0' }}>
                  {Object.entries(stats.lsrw_breakdown).map(([key, val]) => (
                    <div key={key} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase' }}>{key[0]}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>{val.toFixed(0)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : <div style={{ color: 'var(--text3)', textAlign: 'center', padding: 40 }}>Complete your profile first</div>}
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Test scores */}
        <div className="card">
          <div className="card-title">📊 Test Performance</div>
          {testData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={testData}>
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#1a2540', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8 }} />
                <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <p style={{ color: 'var(--text3)', marginBottom: 16 }}>No test results yet</p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/tests/coding')}>Take a Test</button>
            </div>
          )}
        </div>

        {/* Suggestions */}
        <div className="card">
          <div className="card-title">⚡ Priority Actions</div>
          {prioritySugg.length > 0 ? prioritySugg.map((s, i) => (
            <div key={i} className={`suggestion-item ${s.priority}`}>
              <div className="suggestion-icon" style={{ background: s.priority === 'high' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)' }}>
                {s.type === 'coding' ? '💻' : s.type === 'experience' ? '🏢' : s.type === 'academic' ? '📚' : s.type === 'certification' ? '🏆' : '📄'}
              </div>
              <div>
                <div className="suggestion-title">{s.message.split('.')[0]}</div>
                <div className="suggestion-action">→ {s.action}</div>
              </div>
            </div>
          )) : (
            <div style={{ color: 'var(--text3)', textAlign: 'center', padding: 20 }}>
              🎉 Great profile! Keep it up!
            </div>
          )}
          <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: 8 }} onClick={() => navigate('/profile')}>
            View All Suggestions →
          </button>
        </div>
      </div>

      {/* Quick links */}
      <div className="card">
        <div className="card-title">🚀 Quick Practice</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {[
            { icon: '💻', label: 'Coding Test', desc: '5 Problems', to: '/tests/coding', color: '#6366f1' },
            { icon: '🧠', label: 'Aptitude', desc: '10 Questions', to: '/tests/aptitude', color: '#8b5cf6' },
            { icon: '🗣️', label: 'Communication', desc: '5 Scenarios', to: '/tests/communication', color: '#06b6d4' },
            { icon: '📚', label: 'Resources', desc: 'Curated Links', to: '/resources', color: '#10b981' },
          ].map(item => (
            <button key={item.to} className="btn btn-secondary" style={{ padding: '16px', flexDirection: 'column', gap: 6, height: 'auto' }}
              onClick={() => navigate(item.to)}>
              <span style={{ fontSize: 24 }}>{item.icon}</span>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{item.label}</span>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>{item.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
