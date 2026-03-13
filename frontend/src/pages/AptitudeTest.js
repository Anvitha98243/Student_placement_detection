import React, { useEffect, useState } from 'react';
import API from '../utils/api';

export default function AptitudeTest() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    API.get('/tests/aptitude').then(r => setQuestions(r.data.questions)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (submitted || loading) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timer); handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted, loading]);

  const handleAnswer = (qid, optIdx) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qid]: optIdx }));
  };

  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);
    const correct = questions.filter(q => answers[q.id] === q.answer).length;
    setScore(correct);
    setShowResults(true);
    try {
      await API.post('/tests/submit', {
        test_type: 'aptitude', score: correct, total: questions.length,
        details: { answers, time_taken: 600 - timeLeft }
      });
    } catch (e) { console.error(e); }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const answered = Object.keys(answers).length;

  if (loading) return <div style={{ padding: 28, display: 'flex', justifyContent: 'center', marginTop: 60 }}><div className="spinner" /></div>;

  return (
    <div className="content-area fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 className="section-title">🧠 Aptitude Test</h1>
          <p className="section-sub">10 questions covering Math, Reasoning & Logic</p>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {!submitted && (
            <div style={{ background: 'var(--card)', border: `1px solid ${timeLeft < 60 ? 'var(--danger)' : 'var(--border)'}`,
              borderRadius: 10, padding: '8px 16px', fontFamily: 'Space Grotesk', fontWeight: 700,
              fontSize: 20, color: timeLeft < 60 ? 'var(--danger)' : 'var(--text)' }}>
              ⏱️ {formatTime(timeLeft)}
            </div>
          )}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 16px', fontSize: 14, color: 'var(--text2)' }}>
            {answered}/{questions.length} answered
          </div>
        </div>
      </div>

      {showResults && (
        <div className="card fade-in" style={{ marginBottom: 24, textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>{score >= 8 ? '🏆' : score >= 6 ? '🌟' : score >= 4 ? '👍' : '📚'}</div>
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 24, marginBottom: 8 }}>
            You scored {score}/{questions.length}
          </h2>
          <p style={{ color: 'var(--text2)', marginBottom: 16 }}>
            {((score / questions.length) * 100).toFixed(0)}% — {score >= 8 ? 'Excellent!' : score >= 6 ? 'Good job!' : score >= 4 ? 'Keep practicing!' : 'More practice needed'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            {['Correct', 'Wrong', 'Unanswered'].map((label, i) => {
              const val = i === 0 ? score : i === 1 ? answered - score : questions.length - answered;
              const color = i === 0 ? 'var(--success)' : i === 1 ? 'var(--danger)' : 'var(--text3)';
              return (
                <div key={label} style={{ background: 'var(--bg2)', borderRadius: 10, padding: '12px 20px', minWidth: 80 }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color }}>{val}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 16 }}>
        {questions.map((q, qi) => {
          const userAns = answers[q.id];
          const isAnswered = userAns !== undefined;
          const isCorrect = userAns === q.answer;
          return (
            <div key={q.id} className="question-card" style={{ borderColor: showResults && isAnswered ? (isCorrect ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)') : 'var(--border)' }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div className="number-badge">{qi + 1}</div>
                <div>
                  <span className="badge badge-info" style={{ marginBottom: 8 }}>{q.category}</span>
                  <p className="question-text" style={{ margin: 0 }}>{q.question}</p>
                </div>
              </div>
              <div style={{ paddingLeft: 44 }}>
                {q.options.map((opt, oi) => {
                  let cls = 'option-btn';
                  if (showResults) {
                    if (oi === q.answer) cls += ' correct';
                    else if (oi === userAns && userAns !== q.answer) cls += ' wrong';
                  } else if (userAns === oi) cls += ' selected';
                  return (
                    <button key={oi} className={cls} onClick={() => handleAnswer(q.id, oi)} disabled={submitted}>
                      <span style={{ marginRight: 8, fontWeight: 700, color: 'var(--accent)' }}>{String.fromCharCode(65 + oi)}.</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {!submitted && (
        <div style={{ position: 'sticky', bottom: 24, marginTop: 24 }}>
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
            <span style={{ color: 'var(--text2)', fontSize: 14 }}>{questions.length - answered} questions remaining</span>
            <button className="btn btn-primary" onClick={handleSubmit}>
              ✅ Submit Test ({answered}/{questions.length})
            </button>
          </div>
        </div>
      )}

      {submitted && (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button className="btn btn-secondary" onClick={() => { setSubmitted(false); setShowResults(false); setAnswers({}); setTimeLeft(600); }}>
            🔄 Retake Test
          </button>
        </div>
      )}
    </div>
  );
}
