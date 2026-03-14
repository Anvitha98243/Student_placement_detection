import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import API from '../utils/api';

const customTooltipStyle = {
  background: 'rgba(255,255,255,0.92)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(108,99,255,0.2)',
  borderRadius: 10,
  color: '#1a1a2e',
};

export default function Results() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/profile').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner" />
    </div>
  );

  const tests = data?.test_results || [];
  const byType = {};
  tests.forEach(t => {
    if (!byType[t.type]) byType[t.type] = [];
    byType[t.type].push({ date: t.date?.slice(0, 10), score: Math.round((t.score / t.total) * 100) });
  });

  const chartData = (() => {
    const dates = [...new Set(tests.map(t => t.date?.slice(0, 10)))].sort();
    return dates.map(date => {
      const row = { date };
      Object.keys(byType).forEach(type => {
        const entry = byType[type].find(e => e.date === date);
        if (entry) row[type] = entry.score;
      });
      return row;
    });
  })();

  const COLORS = { coding: '#6c63ff', aptitude: '#d97706', communication: '#0891b2' };

  return (
    <>
      <div className="page-header-aurora">
        <div className="aurora-blob-1 aurora-blob" />
        <div className="aurora-blob-2 aurora-blob" />
        <div className="aurora-blob-3 aurora-blob" />
        <h1 className="page-title">📊 My Results</h1>
        <p className="page-subtitle">Track your performance across all tests</p>
      </div>

      <div className="content-area fade-in">
        {tests.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 72, background: 'linear-gradient(135deg,rgba(196,212,255,0.4),rgba(224,200,255,0.4))' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📝</div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, color: 'var(--nav-bg)', marginBottom: 8 }}>No test results yet</h3>
            <p style={{ color: 'var(--text2)' }}>Take some tests to see your results here!</p>
          </div>
        ) : (
          <>
            <div className="stats-grid" style={{ marginBottom: 24 }}>
              {Object.entries(byType).map(([type, arr]) => {
                const best = Math.max(...arr.map(a => a.score));
                const latest = arr[arr.length - 1]?.score || 0;
                return (
                  <div key={type} className="stat-card blue">
                    <div className="stat-icon blue" style={{ fontSize: 20 }}>
                      {type === 'coding' ? '💻' : type === 'aptitude' ? '🧠' : '🗣️'}
                    </div>
                    <div className="stat-value" style={{ color: COLORS[type] }}>{latest}%</div>
                    <div className="stat-label">{type.charAt(0).toUpperCase() + type.slice(1)} (Latest)</div>
                    <div className="stat-change up">Best: {best}%</div>
                  </div>
                );
              })}
            </div>

            {chartData.length > 1 && (
              <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-title">📈 Score Progress Over Time</div>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" tick={{ fill: '#4b5563', fontSize: 11, fontFamily: 'DM Sans' }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#4b5563', fontSize: 11 }} />
                    <Tooltip contentStyle={customTooltipStyle} />
                    <Legend />
                    {Object.keys(byType).map(type => (
                      <Line key={type} type="monotone" dataKey={type} stroke={COLORS[type]}
                        strokeWidth={2.5} dot={{ r: 4, fill: COLORS[type] }} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="card">
              <div className="card-title">🗂️ All Test History</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(108,99,255,0.1)' }}>
                      {['Test Type', 'Score', 'Percentage', 'Date'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: 'var(--text2)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...tests].reverse().map((t, i) => {
                      const pct = Math.round((t.score / t.total) * 100);
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(108,99,255,0.07)', transition: 'background 0.15s' }}
                          onMouseOver={e => e.currentTarget.style.background = 'rgba(108,99,255,0.04)'}
                          onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>{t.type === 'coding' ? '💻' : t.type === 'aptitude' ? '🧠' : '🗣️'}</span>
                            <span style={{ fontWeight: 600, color: 'var(--nav-bg)' }}>{t.type.charAt(0).toUpperCase() + t.type.slice(1)}</span>
                          </td>
                          <td style={{ padding: '12px 14px', color: 'var(--text2)' }}>{t.score}/{t.total}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <span className={`badge ${pct>=70?'badge-success':pct>=50?'badge-warning':'badge-danger'}`}>{pct}%</span>
                          </td>
                          <td style={{ padding: '12px 14px', color: 'var(--text3)', fontSize: 12 }}>{t.date?.slice(0, 10)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}