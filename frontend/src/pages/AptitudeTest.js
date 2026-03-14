import React, { useState, useEffect, useMemo } from 'react';
import aptitudeData from '../data/aptitudeData';

export default function AptitudeTest() {
  const categories = Object.keys(aptitudeData);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState({});

  const questions = useMemo(() => aptitudeData[selectedCategory] || [], [selectedCategory]);
  const currentQuestion = questions[currentQuestionIdx];

  const handleAnswer = (qId, optionIdx) => {
    if (userAnswers[qId] !== undefined) return;
    setUserAnswers(prev => ({ ...prev, [qId]: optionIdx }));
    setShowExplanation(prev => ({ ...prev, [qId]: true }));
  };

  const progress = questions.length > 0
    ? Math.round((questions.filter(q => userAnswers[q.id] !== undefined).length / questions.length) * 100) : 0;

  const stats = useMemo(() => {
    let correct = 0, wrong = 0;
    questions.forEach(q => {
      if (userAnswers[q.id] !== undefined) {
        if (userAnswers[q.id] === q.answer) correct++; else wrong++;
      }
    });
    return { correct, wrong, unvisited: questions.length - (correct + wrong) };
  }, [questions, userAnswers]);

  const scrollToQuestion = (idx) => {
    setCurrentQuestionIdx(idx);
    document.getElementById(`question-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <div className="page-header-aurora">
        <div className="aurora-blob-1 aurora-blob" />
        <div className="aurora-blob-2 aurora-blob" />
        <div className="aurora-blob-3 aurora-blob" />
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="page-title">🧠 Aptitude Master</h1>
            <p className="page-subtitle">Practice {selectedCategory} questions with detailed explanations</p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.85)', borderRadius: 999,
            padding: '8px 18px', fontSize: 14, fontWeight: 600, color: 'var(--nav-bg)'
          }}>
            Progress: {progress}%
          </div>
        </div>
      </div>

      <div className="content-area fade-in">
        <div className="aptitude-container">
          {/* Left Sidebar */}
          <div className="aptitude-sidebar">
            <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 800, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '1.2px' }}>
              Available Topics
            </div>
            {categories.map(cat => (
              <div key={cat} className={`topic-item ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => { setSelectedCategory(cat); setCurrentQuestionIdx(0); }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: selectedCategory === cat ? '#fff' : 'var(--accent)', opacity: selectedCategory === cat ? 1 : 0.5, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{cat}</span>
                </div>
                <span style={{ fontSize: 11, opacity: 0.7 }}>{aptitudeData[cat].length} Qs</span>
              </div>
            ))}
          </div>

          {/* Middle: Questions */}
          <div className="aptitude-main">
            {questions.map((q, idx) => (
              <div key={q.id} id={`question-${idx}`} className="card" style={{
                marginBottom: 20, padding: 28,
                borderColor: userAnswers[q.id] !== undefined
                  ? (userAnswers[q.id] === q.answer ? 'rgba(5,150,105,0.35)' : 'rgba(220,38,38,0.35)')
                  : 'var(--glass-border)'
              }}>
                <div style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                    background: userAnswers[q.id] !== undefined ? (userAnswers[q.id] === q.answer ? '#059669' : '#dc2626') : 'var(--nav-bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: '#fff'
                  }}>{idx + 1}</div>
                  <h3 style={{ fontSize: 16, lineHeight: 1.6, fontWeight: 600, color: 'var(--nav-bg)' }}>{q.question}</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {q.options.map((opt, oi) => {
                    const isSelected = userAnswers[q.id] === oi;
                    const isCorrect = oi === q.answer;
                    const answered = userAnswers[q.id] !== undefined;
                    let bg = 'rgba(255,255,255,0.6)', border = 'rgba(108,99,255,0.15)', color = 'var(--text)';
                    if (answered) {
                      if (isCorrect) { bg = 'rgba(5,150,105,0.08)'; border = '#059669'; color = '#065f46'; }
                      else if (isSelected) { bg = 'rgba(220,38,38,0.08)'; border = '#dc2626'; color = '#991b1b'; }
                    }
                    return (
                      <button key={oi} onClick={() => handleAnswer(q.id, oi)}
                        className="option-btn"
                        style={{ background: bg, borderColor: border, color, margin: 0, display: 'flex', alignItems: 'center', gap: 10,
                          opacity: answered && !isSelected && !isCorrect ? 0.55 : 1 }}>
                        <span style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid currentColor',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                          {String.fromCharCode(65 + oi)}
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {showExplanation[q.id] && (
                  <div className={`explanation-card fade-in ${userAnswers[q.id] === q.answer ? '' : 'wrong'}`}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>
                      {userAnswers[q.id] === q.answer ? '✅ Correct!' : '❌ Incorrect'}
                    </div>
                    <div style={{ color: 'var(--text2)', marginBottom: 8, fontSize: 13 }}>
                      Correct answer: <strong>Option {String.fromCharCode(65 + q.answer)}</strong>
                    </div>
                    <div style={{ padding: 10, background: 'rgba(0,0,0,0.04)', borderRadius: 6, fontSize: 13 }}>
                      {q.explanation}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Sidebar */}
          <div className="aptitude-right">
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--nav-bg)', marginBottom: 14 }}>Overview</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {[['correct', '#059669', stats.correct], ['wrong', '#dc2626', stats.wrong], ['left', 'var(--text3)', stats.unvisited]].map(([label, color, val]) => (
                  <div key={label} style={{ textAlign: 'center', padding: '12px 8px', background: 'rgba(255,255,255,0.6)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.75)' }}>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color }}>{val}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--nav-bg)' }}>Question Palette</span>
                <button className="btn btn-sm btn-secondary"
                  onClick={() => { setUserAnswers({}); setShowExplanation({}); setCurrentQuestionIdx(0); }}>
                  Reset
                </button>
              </div>
              <div className="palette-grid">
                {questions.map((q, idx) => (
                  <div key={idx} className={`palette-box ${userAnswers[q.id] !== undefined ? 'answered' : ''} ${currentQuestionIdx === idx ? 'current' : ''}`}
                    onClick={() => scrollToQuestion(idx)}>
                    {idx + 1}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, rgba(196,212,255,0.4), rgba(224,200,255,0.4))', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.75)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase' }}>Pro Tip</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
                Solving topic-wise helps identify strong and weak areas. Focus on accuracy first!
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}