import React, { useEffect, useState } from 'react';
import API from '../utils/api';

const CATEGORIES = [
  { id: 'coding', label: '💻 Coding' },
  { id: 'communication', label: '🗣️ Communication' },
  { id: 'certifications', label: '📜 Certifications' },
  { id: 'resume', label: '📄 Resume' },
];

const TYPE_BADGE = {
  platform: 'badge-purple', website: 'badge-info',
  course: 'badge-warning', community: 'badge-success',
  certification: 'badge-warning', tool: 'badge-info',
};

export default function Resources() {
  const [resources, setResources] = useState({});
  const [active, setActive] = useState('coding');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/resources').then(r => setResources(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner" />
    </div>
  );

  const current = resources[active] || [];

  return (
    <>
      <div className="page-header-aurora">
        <div className="aurora-blob-1 aurora-blob" />
        <div className="aurora-blob-2 aurora-blob" />
        <div className="aurora-blob-3 aurora-blob" />
        <h1 className="page-title">📚 Learning Resources</h1>
        <p className="page-subtitle">Curated resources to boost your placement preparation</p>
      </div>

      <div className="content-area fade-in">
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
              <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 4 }}>🔗 Visit →</div>
            </a>
          ))}
        </div>

        <div className="card" style={{ marginTop: 36 }}>
          <div className="card-title">🎯 Placement Preparation Roadmap</div>
          {[
            { step: '1', title: '3–6 Months Before', color: 'linear-gradient(135deg,#b8f0c8,#c4d4ff)', items: ['Build 3+ projects', 'Start LeetCode (Easy → Medium)', 'Get 2+ certifications', 'Prepare resume'] },
            { step: '2', title: '1–3 Months Before', color: 'linear-gradient(135deg,#c4d4ff,#e0c8ff)', items: ['Apply for internships', 'Mock interviews (coding + HR)', 'Practice communication', 'Research target companies'] },
            { step: '3', title: '1 Month Before', color: 'linear-gradient(135deg,#e0c8ff,#ffd6e0)', items: ['Company-specific prep', 'Review DSA topics', 'Polish LinkedIn profile', 'Network with seniors'] },
          ].map((phase, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, paddingBottom: 20, paddingTop: i > 0 ? 20 : 0, borderTop: i > 0 ? '1px solid rgba(108,99,255,0.1)' : 'none' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: phase.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'var(--nav-bg)', flexShrink: 0, border: '2px solid rgba(255,255,255,0.8)' }}>
                {phase.step}
              </div>
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--nav-bg)', marginBottom: 8 }}>{phase.title}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {phase.items.map(item => (
                    <span key={item} style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.85)', borderRadius: 8, padding: '4px 12px', fontSize: 12, color: 'var(--text2)' }}>
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}