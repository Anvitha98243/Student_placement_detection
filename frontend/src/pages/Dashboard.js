import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import API from '../utils/api';
import { useAuth } from '../utils/AuthContext';

function ProbCircle({ value }) {
  const radius = 52, circ = 2 * Math.PI * radius;
  const pct = Math.min(100, Math.max(0, value || 0));
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 70 ? '#059669' : pct >= 50 ? '#d97706' : '#dc2626';
  return (
    <div className="prob-circle-wrap">
      <div className="prob-circle">
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r={radius} fill="none" stroke="rgba(108,99,255,0.10)" strokeWidth="9" />
          <circle cx="65" cy="65" r={radius} fill="none" stroke={color} strokeWidth="9"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)' }} />
        </svg>
        <div className="prob-value" style={{ color }}>
          {pct.toFixed(1)}%
          <span>Placement</span>
        </div>
      </div>
    </div>
  );
}

const TooltipStyle = {
  background: 'rgba(255,255,255,0.94)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(108,99,255,0.18)',
  borderRadius: 10,
  boxShadow: '0 4px 20px rgba(80,60,180,0.12)',
  color: '#111827',
  fontSize: 13,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/dashboard/stats').then(r => setStats(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner" />
    </div>
  );

  if (!stats?.has_profile) return (
    <>
      <div className="page-header-aurora">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome, {user?.name}!</p>
        </div>
      </div>
      <div className="content-area fade-in">
        <div style={{ maxWidth: 500, margin: '60px auto', textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            background: 'linear-gradient(135deg, #b8f0c8, #c7bbff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 38, margin: '0 auto 22px',
            boxShadow: '0 8px 28px rgba(80,60,180,0.14)',
            border: '2px solid rgba(255,255,255,0.8)',
          }}>👋</div>
          <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 26, fontWeight: 800, color: '#1a1a2e', marginBottom: 10, letterSpacing: '-0.03em' }}>
            Welcome, {user?.name}!
          </h2>
          <p style={{ color: '#4b5563', marginBottom: 30, fontSize: 15, lineHeight: 1.65 }}>
            Set up your profile so our AI can analyse your details and predict your placement chances.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/profile')}>
            🚀 Setup My Profile
          </button>
        </div>
      </div>
    </>
  );

  const radarData = stats.skills ? [
    { skill: 'Programming',    value: (stats.skills.programming || 0) * 10 },
    { skill: 'Communication',  value: (stats.skills.communication || 0) * 10 },
    { skill: 'Problem Solving',value: (stats.skills.problem_solving || 0) * 10 },
    { skill: 'Teamwork',       value: (stats.skills.teamwork || 0) * 10 },
    { skill: 'Leadership',     value: (stats.skills.leadership || 0) * 10 },
  ] : [];

  const testData = stats.test_history
    ? Object.entries(stats.test_history).map(([type, scores]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        score: scores[scores.length - 1] || 0
      }))
    : [];

  const prioritySugg = (stats.suggestions || []).filter(s => s.priority === 'high').slice(0, 2);

  return (
    <>
      <div className="page-header-aurora">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Welcome back, {user?.name} 👋</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/profile')}>
            Update Profile
          </button>
        </div>
      </div>

      <div className="content-area fade-in">

        {/* Stat cards */}
        <div className="stats-grid stagger">
          {[
            { label: 'Placement Chance', value: `${(stats.placement_probability || 0).toFixed(1)}%`, icon: '🎯', color: 'blue' },
            { label: 'Resume Score',     value: `${stats.resume_score || 0}/100`,                    icon: '📄', color: 'green' },
            { label: 'Tests Taken',      value: stats.total_tests_taken || 0,                         icon: '📝', color: 'purple' },
            { label: 'CGPA',             value: stats.academics?.cgpa || '—',                         icon: '🏫', color: 'orange' },
          ].map(s => (
            <div key={s.label} className={`stat-card ${s.color} fade-in`}>
              <div className={`stat-icon ${s.color}`}>{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid-2" style={{ marginBottom: 20 }}>
          {/* Placement prediction */}
          <div className="card">
            <div className="card-title">🎯 Placement Prediction</div>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              <ProbCircle value={stats.placement_probability} />
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 14 }}>
                  {[
                    { label: 'CGPA',           val: `${stats.academics?.cgpa || 0}/10` },
                    { label: 'Internships',    val: stats.extras?.internships || 0 },
                    { label: 'Projects',       val: stats.extras?.projects || 0 },
                    { label: 'Certifications', val: stats.extras?.certifications || 0 },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9, fontSize: 13 }}>
                      <span style={{ color: '#6b7280', fontWeight: 400 }}>{item.label}</span>
                      <span style={{ fontWeight: 600, color: '#111827', fontSize: 14 }}>{item.val}</span>
                    </div>
                  ))}
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/profile')}
                  style={{ width: '100%' }}>
                  Improve Score
                </button>
              </div>
            </div>
          </div>

          {/* Skills radar */}
          <div className="card">
            <div className="card-title">💡 Skills Overview</div>
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(108,99,255,0.12)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: '#6b7280', fontSize: 11, fontFamily: "'Plus Jakarta Sans',sans-serif" }} />
                  <Radar name="Skills" dataKey="value" stroke="#6c63ff" fill="#6c63ff" fillOpacity={0.16} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ color: '#9ca3af', textAlign: 'center', padding: '40px 0', fontSize: 14 }}>
                Complete your profile first
              </div>
            )}
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: 20 }}>
          {/* Test scores */}
          <div className="card">
            <div className="card-title">📊 Test Performance</div>
            {testData.length > 0 ? (
              <ResponsiveContainer width="100%" height={170}>
                <BarChart data={testData} barSize={32}>
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12, fontFamily: "'Plus Jakarta Sans',sans-serif" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} domain={[0, 100]} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TooltipStyle} cursor={{ fill: 'rgba(108,99,255,0.05)' }} />
                  <Bar dataKey="score" fill="#6c63ff" radius={[7, 7, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '36px 0' }}>
                <p style={{ color: '#9ca3af', marginBottom: 14, fontSize: 14 }}>No test results yet</p>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/tests/coding')}>Take a Test</button>
              </div>
            )}
          </div>

          {/* Priority suggestions */}
          <div className="card">
            <div className="card-title">⚡ Priority Actions</div>
            {prioritySugg.length > 0 ? prioritySugg.map((s, i) => (
              <div key={i} className={`suggestion-item ${s.priority}`}>
                <div className="suggestion-icon" style={{
                  background: s.priority === 'high' ? 'rgba(239,68,68,0.09)' : 'rgba(245,158,11,0.09)'
                }}>
                  {s.type === 'coding' ? '💻' : s.type === 'experience' ? '🏢' : s.type === 'academic' ? '📚' : s.type === 'certification' ? '🏆' : '📄'}
                </div>
                <div>
                  <div className="suggestion-title">{s.message.split('.')[0]}</div>
                  <div className="suggestion-action">→ {s.action}</div>
                </div>
              </div>
            )) : (
              <div style={{ color: '#6b7280', textAlign: 'center', padding: '24px 0', fontSize: 14 }}>
                🎉 Great profile! Keep it up!
              </div>
            )}
            <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: 8 }}
              onClick={() => navigate('/profile')}>
              View All Suggestions →
            </button>
          </div>
        </div>

        {/* Quick practice */}
        <div className="card">
          <div className="card-title">🚀 Quick Practice</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            {[
              { icon: '💻', label: 'Coding Test',    desc: '5 Problems',   to: '/tests/coding',        bg: 'linear-gradient(135deg,#c4d4ff,#e0c8ff)' },
              { icon: '🧠', label: 'Aptitude',       desc: '10 Questions', to: '/tests/aptitude',      bg: 'linear-gradient(135deg,#b8f0c8,#c4d4ff)' },
              { icon: '🗣️', label: 'Communication', desc: '5 Scenarios',  to: '/tests/communication', bg: 'linear-gradient(135deg,#ffd6e0,#e0c8ff)' },
              { icon: '📚', label: 'Resources',      desc: 'Curated Links',to: '/resources',           bg: 'linear-gradient(135deg,#b8f0c8,#ffd6e0)' },
            ].map(item => (
              <button key={item.to} className="quick-action-card" onClick={() => navigate(item.to)}
                style={{
                  padding: '18px 14px', background: item.bg,
                  border: '1.5px solid rgba(255,255,255,0.82)', borderRadius: 14,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                  cursor: 'pointer', backdropFilter: 'blur(4px)',
                }}>
                <span style={{ fontSize: 26 }}>{item.icon}</span>
                <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 13, color: '#1a1a2e', letterSpacing: '-0.01em' }}>{item.label}</span>
                <span style={{ fontSize: 11, color: 'rgba(13,13,26,0.48)', fontWeight: 400 }}>{item.desc}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}