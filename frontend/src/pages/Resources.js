import React, { useEffect, useState } from 'react';
import API from '../utils/api';

const CATEGORIES = [
  { id: 'coding', label: '💻 Coding', color: '#6366f1' },
  { id: 'communication', label: '🗣️ Communication', color: '#06b6d4' },
  { id: 'certifications', label: '📜 Certifications', color: '#f59e0b' },
  { id: 'resume', label: '📄 Resume', color: '#10b981' },
];

const TYPE_BADGE = {
  platform: 'badge-purple',
  website: 'badge-info',
  course: 'badge-warning',
  community: 'badge-success',
  certification: 'badge-warning',
  tool: 'badge-info',
};

export default function Resources() {
  const [resources, setResources] = useState({});
  const [active, setActive] = useState('coding');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/resources').then(r => setResources(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 28, display: 'flex', justifyContent: 'center', marginTop: 60 }}><div className="spinner" /></div>;

  const current = resources[active] || [];

  return (
    <div className="content-area fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title">📚 Learning Resources</h1>
        <p className="section-sub">Curated resources to boost your placement preparation</p>
      </div>

      <div className="tab-nav" style={{ marginBottom: 28 }}>
        {CATEGORIES.map(c => (
          <button key={c.id} className={`tab-btn${active === c.id ? ' active' : ''}`} onClick={() => setActive(c.id)}>
            {c.label}
          </button>
        ))}
      </div>

      <div className="resource-grid">
        {current.map((r, i) => (
          <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="resource-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="resource-title">{r.title}</div>
              <span className={`badge ${TYPE_BADGE[r.type] || 'badge-info'}`}>{r.type}</span>
            </div>
            <div className="resource-desc">{r.description}</div>
            <div style={{ fontSize: 11, color: 'var(--accent3)', marginTop: 4 }}>🔗 Visit →</div>
          </a>
        ))}
      </div>

      <div className="card" style={{ marginTop: 32 }}>
        <div className="card-title">🎯 Placement Preparation Roadmap</div>
        <div style={{ display: 'grid', gap: 0 }}>
          {[
            { step: '1', title: '3–6 Months Before', items: ['Build 3+ projects', 'Start LeetCode (Easy → Medium)', 'Get 2+ certifications', 'Prepare resume'] },
            { step: '2', title: '1–3 Months Before', items: ['Apply for internships', 'Mock interviews (coding + HR)', 'Practice communication', 'Research target companies'] },
            { step: '3', title: '1 Month Before', items: ['Company-specific prep', 'Review DSA topics', 'Polish LinkedIn profile', 'Network with seniors'] },
          ].map((phase, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, paddingBottom: 20, paddingTop: i > 0 ? 20 : 0, borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, var(--accent), var(--accent2))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontFamily: 'Space Grotesk', flexShrink: 0 }}>
                {phase.step}
              </div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>{phase.title}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {phase.items.map(item => (
                    <span key={item} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px', fontSize: 12, color: 'var(--text2)' }}>
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
