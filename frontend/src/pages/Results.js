import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import API from '../utils/api';

export default function Results() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/profile').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 28, display: 'flex', justifyContent: 'center', marginTop: 60 }}><div className="spinner" /></div>;

  const tests = data?.test_results || [];

  // Group by type
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

  const COLORS = { coding: '#6366f1', aptitude: '#f59e0b', communication: '#06b6d4' };

  return (
    <div className="content-area fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 className="section-title">📊 My Results</h1>
        <p className="section-sub">Track your performance across all tests</p>
      </div>

      {tests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📝</div>
          <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 20, marginBottom: 8 }}>No test results yet</h3>
          <p style={{ color: 'var(--text2)' }}>Take some tests to see your results here!</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
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

          {/* Progress chart */}
          {chartData.length > 1 && (
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-title">📈 Score Progress Over Time</div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1a2540', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8 }} />
                  <Legend />
                  {Object.keys(byType).map(type => (
                    <Line key={type} type="monotone" dataKey={type} stroke={COLORS[type]} strokeWidth={2} dot={{ r: 4, fill: COLORS[type] }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Recent results table */}
          <div className="card">
            <div className="card-title">🗂️ All Test History</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Test Type', 'Score', 'Percentage', 'Date'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text2)', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...tests].reverse().map((t, i) => {
                    const pct = Math.round((t.score / t.total) * 100);
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(99,130,255,0.08)' }}>
                        <td style={{ padding: '12px 12px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>{t.type === 'coding' ? '💻' : t.type === 'aptitude' ? '🧠' : '🗣️'}</span>
                            <span style={{ fontWeight: 500 }}>{t.type.charAt(0).toUpperCase() + t.type.slice(1)}</span>
                          </span>
                        </td>
                        <td style={{ padding: '12px 12px' }}>{t.score}/{t.total}</td>
                        <td style={{ padding: '12px 12px' }}>
                          <span className={`badge ${pct >= 70 ? 'badge-success' : pct >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                            {pct}%
                          </span>
                        </td>
                        <td style={{ padding: '12px 12px', color: 'var(--text3)', fontSize: 12 }}>{t.date?.slice(0, 10)}</td>
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
  );
}
