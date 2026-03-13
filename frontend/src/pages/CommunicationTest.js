import React, { useEffect, useState } from 'react';
import API from '../utils/api';

export default function CommunicationTest() {
  const [scenarios, setScenarios] = useState([]);
  const [answers, setAnswers] = useState({});
  const [emailText, setEmailText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({});

  useEffect(() => {
    API.get('/tests/communication').then(r => setScenarios(r.data.scenarios)).finally(() => setLoading(false));
  }, []);

  const gradeEmail = (text) => {
    let pts = 0;
    const hints = ['subject', 'dear', 'regards', 'leave', 'date', 'sincerely', 'request', 'apologize', 'inform', 'kindly'];
    hints.forEach(h => { if (text.toLowerCase().includes(h)) pts++; });
    if (text.length > 100) pts += 2;
    if (text.length > 200) pts += 1;
    return Math.min(1, pts >= 5 ? 1 : pts >= 3 ? 0.7 : 0);
  };

  const handleSubmit = async () => {
    const mcq = scenarios.filter(s => s.type !== 'email' && s.type !== 'prompt');
    const mcqCorrect = mcq.filter(s => answers[s.id] === s.answer).length;
    const emailScore = emailText ? gradeEmail(emailText) : 0;
    const total = mcq.length + 1;
    const totalScore = mcqCorrect + emailScore;

    const fb = {};
    mcq.forEach(s => {
      fb[s.id] = answers[s.id] === s.answer ? 'correct' : 'wrong';
    });
    fb['email'] = emailScore >= 0.7 ? 'correct' : 'partial';

    setFeedback(fb);
    setScore(totalScore);
    setSubmitted(true);

    try {
      await API.post('/tests/submit', {
        test_type: 'communication',
        score: Math.round(totalScore),
        total,
        details: { mcq_correct: mcqCorrect, email_score: emailScore }
      });
    } catch (e) { console.error(e); }
  };

  if (loading) return <div style={{ padding: 28, display: 'flex', justifyContent: 'center', marginTop: 60 }}><div className="spinner" /></div>;

  return (
    <div className="content-area fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 className="section-title">🗣️ Communication Test</h1>
        <p className="section-sub">Assess your professional communication and interpersonal skills</p>
      </div>

      {submitted && (
        <div className="card fade-in" style={{ marginBottom: 24, textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>{score >= 4 ? '🌟' : score >= 2.5 ? '👍' : '📚'}</div>
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 24, marginBottom: 8 }}>Communication Score</h2>
          <div style={{ fontSize: 48, fontWeight: 800, color: '#6366f1', margin: '8px 0' }}>
            {score.toFixed(1)}/{scenarios.filter(s => s.type !== 'email').length + 1}
          </div>
          <p style={{ color: 'var(--text2)' }}>
            {score >= 4 ? 'Excellent communicator! You\'re interview-ready.' : score >= 2.5 ? 'Good communication skills. Keep practicing.' : 'Work on your professional communication.'}
          </p>
        </div>
      )}

      {scenarios.map((sc, i) => (
        <div key={sc.id} className="question-card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-start' }}>
            <div className="number-badge">{i + 1}</div>
            <div style={{ flex: 1 }}>
              <span className={`badge ${sc.type === 'email' ? 'badge-purple' : sc.type === 'situation' ? 'badge-info' : 'badge-warning'}`} style={{ marginBottom: 10 }}>
                {sc.type === 'email' ? '📧 Email Writing' : sc.type === 'situation' ? '💼 Situation' : '📝 Fill Blank'}
              </span>
              <p className="question-text">{sc.prompt}</p>
            </div>
          </div>

          {sc.type === 'email' && (
            <div>
              {sc.hints && (
                <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>💡 Include these elements:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {sc.hints.map(h => <span key={h} className="badge badge-info">{h}</span>)}
                  </div>
                </div>
              )}
              <textarea
                className="code-editor"
                value={emailText}
                onChange={e => setEmailText(e.target.value)}
                placeholder="Write your professional email here..."
                rows={8}
                disabled={submitted}
                style={{ fontFamily: 'Outfit, sans-serif' }}
              />
              {submitted && (
                <div style={{ marginTop: 8 }} className={`alert ${feedback['email'] === 'correct' ? 'alert-success' : 'alert-warning'}`}>
                  {feedback['email'] === 'correct' ? '✅ Well-written email! Good use of professional language.' : '⚠️ Include formal salutation, clear reason, dates, and sign-off.'}
                </div>
              )}
            </div>
          )}

          {(sc.type === 'situation' || sc.type === 'fill_blank') && sc.options && (
            <div>
              {sc.options.map((opt, oi) => {
                let cls = 'option-btn';
                if (submitted) {
                  if (oi === sc.answer) cls += ' correct';
                  else if (oi === answers[sc.id] && answers[sc.id] !== sc.answer) cls += ' wrong';
                } else if (answers[sc.id] === oi) cls += ' selected';
                return (
                  <button key={oi} className={cls} onClick={() => !submitted && setAnswers(p => ({ ...p, [sc.id]: oi }))} disabled={submitted}>
                    <span style={{ marginRight: 8, fontWeight: 700, color: 'var(--accent)' }}>{String.fromCharCode(65 + oi)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {!submitted ? (
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <button className="btn btn-primary btn-lg" onClick={handleSubmit}>
            ✅ Submit Communication Test
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button className="btn btn-secondary" onClick={() => { setSubmitted(false); setAnswers({}); setEmailText(''); setFeedback({}); }}>
            🔄 Try Again
          </button>
        </div>
      )}
    </div>
  );
}
