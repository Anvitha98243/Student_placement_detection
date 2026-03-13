import React, { useEffect, useState } from 'react';
import API from '../utils/api';

export default function CodingTest() {
  const [problems, setProblems] = useState([]);
  const [current, setCurrent] = useState(0);
  const [code, setCode] = useState('');
  const [results, setResults] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/tests/coding').then(r => {
      setProblems(r.data.problems);
      setCode(r.data.problems[0]?.starter_code || '');
    }).finally(() => setLoading(false));
  }, []);

  const handleProblemChange = (idx) => {
    setCurrent(idx);
    setCode(results[idx]?.code || problems[idx]?.starter_code || '');
  };

  const handleSave = () => {
    setResults(prev => ({ ...prev, [current]: { code, solved: code.length > 100 } }));
    if (current < problems.length - 1) {
      const next = current + 1;
      setCurrent(next);
      setCode(results[next]?.code || problems[next]?.starter_code || '');
    }
  };

  const handleSubmit = async () => {
    const solved = Object.values(results).filter(r => r.solved).length;
    const total = problems.length;
    setFinalScore({ solved, total });
    setSubmitted(true);
    try {
      await API.post('/tests/submit', {
        test_type: 'coding', score: solved, total,
        details: { problems_attempted: Object.keys(results).length }
      });
    } catch (e) { console.error(e); }
  };

  if (loading) return <div style={{ padding: 28, display: 'flex', justifyContent: 'center', marginTop: 60 }}><div className="spinner" /></div>;

  if (submitted && finalScore) return (
    <div className="content-area fade-in" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Space Grotesk', marginBottom: 8 }}>Test Complete!</h2>
        <div style={{ fontSize: 48, fontWeight: 800, color: '#6366f1', margin: '16px 0' }}>
          {finalScore.solved}/{finalScore.total}
        </div>
        <p style={{ color: 'var(--text2)', marginBottom: 24 }}>
          Score: {((finalScore.solved / finalScore.total) * 100).toFixed(0)}% — {finalScore.solved >= 3 ? '🌟 Excellent!' : finalScore.solved >= 2 ? '👍 Good!' : '📚 Keep practicing!'}
        </p>
        <div style={{ background: 'var(--bg2)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>Your programming skill score has been updated in your profile.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setSubmitted(false); setFinalScore(null); setResults({}); setCurrent(0); setCode(problems[0]?.starter_code || ''); }}>
          Try Again
        </button>
      </div>
    </div>
  );

  const prob = problems[current];

  return (
    <div className="content-area fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 className="section-title">💻 Coding Test</h1>
        <p className="section-sub">Solve the problems below to improve your programming skill score</p>
      </div>
      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Problem list + current problem */}
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {problems.map((p, i) => (
              <button key={i} onClick={() => handleProblemChange(i)}
                className="btn" style={{
                  background: i === current ? 'var(--accent)' : results[i]?.solved ? 'rgba(16,185,129,0.2)' : 'var(--card2)',
                  color: i === current ? 'white' : results[i]?.solved ? '#10b981' : 'var(--text2)',
                  border: `1px solid ${i === current ? 'var(--accent)' : results[i]?.solved ? 'rgba(16,185,129,0.4)' : 'var(--border)'}`,
                  padding: '6px 14px', fontSize: 13
                }}>
                {i + 1}. {p.title.split(' ')[0]}
              </button>
            ))}
          </div>

          {prob && (
            <div className="question-card">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700 }}>{prob.title}</h3>
                <span className={`badge ${prob.difficulty === 'Easy' ? 'badge-success' : prob.difficulty === 'Medium' ? 'badge-warning' : 'badge-danger'}`}>
                  {prob.difficulty}
                </span>
                <span className="badge badge-info">{prob.category}</span>
              </div>
              <p style={{ color: 'var(--text2)', lineHeight: 1.6, marginBottom: 16, fontSize: 14 }}>{prob.description}</p>
              {prob.examples?.map((ex, i) => (
                <div key={i} style={{ background: 'var(--bg)', borderRadius: 8, padding: 12, marginBottom: 8, fontSize: 13 }}>
                  <div style={{ color: 'var(--text3)', marginBottom: 4 }}>Example:</div>
                  <div><span style={{ color: '#94a3b8' }}>Input: </span><code style={{ color: '#a5b4fc' }}>{ex.input}</code></div>
                  <div><span style={{ color: '#94a3b8' }}>Output: </span><code style={{ color: '#6ee7b7' }}>{ex.output}</code></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Code editor */}
        <div className="card">
          <div className="card-title">📝 Your Solution</div>
          <textarea
            className="code-editor"
            value={code}
            onChange={e => setCode(e.target.value)}
            rows={14}
            spellCheck={false}
            placeholder="Write your solution here..."
          />
          <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text3)' }}>
            💡 Tip: A solution with 100+ characters is considered attempted
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>
              {current < problems.length - 1 ? '💾 Save & Next' : '✅ Save Solution'}
            </button>
          </div>
          <div className="divider" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>
            <span>Attempted: {Object.keys(results).length}/{problems.length}</span>
            <span>Solved: {Object.values(results).filter(r => r.solved).length}</span>
          </div>
          <button className="btn btn-success" style={{ width: '100%' }} onClick={handleSubmit}
            disabled={Object.keys(results).length === 0}>
            🚀 Submit All Solutions
          </button>
        </div>
      </div>
    </div>
  );
}
