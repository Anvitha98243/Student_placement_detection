import React, { useState, useEffect, useMemo } from 'react';
import aptitudeData from '../data/aptitudeData';

export default function AptitudeTest() {
  const categories = Object.keys(aptitudeData);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { qId: optionIndex }
  const [showExplanation, setShowExplanation] = useState({}); // { qId: boolean }

  const questions = useMemo(() => {
    return aptitudeData[selectedCategory] || [];
  }, [selectedCategory]);

  const currentQuestion = questions[currentQuestionIdx];

  const handleAnswer = (qId, optionIdx) => {
    if (userAnswers[qId] !== undefined) return;
    setUserAnswers(prev => ({ ...prev, [qId]: optionIdx }));
    setShowExplanation(prev => ({ ...prev, [qId]: true }));
  };

  const progress = questions.length > 0 
    ? Math.round((questions.filter(q => userAnswers[q.id] !== undefined).length / questions.length) * 100)
    : 0;

  const stats = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    questions.forEach(q => {
      if (userAnswers[q.id] !== undefined) {
        if (userAnswers[q.id] === q.answer) correct++;
        else wrong++;
      }
    });
    return { correct, wrong, unvisited: questions.length - (correct + wrong) };
  }, [questions, userAnswers]);

  const scrollToQuestion = (idx) => {
    setCurrentQuestionIdx(idx);
    const element = document.getElementById(`question-${idx}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="content-area fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="section-title">🧠 Aptitude Master</h1>
          <p className="section-sub">Practice {selectedCategory} questions with detailed explanations</p>
        </div>
        <div className="badge badge-info" style={{ padding: '10px 20px', fontSize: '15px' }}>
          Overall Progress: {progress}%
        </div>
      </div>

      <div className="aptitude-container">
        {/* Left Sidebar: Topics */}
        <div className="aptitude-sidebar">
          <div style={{ fontSize: '13px', color: 'var(--text3)', fontWeight: '800', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '1.2px' }}>
            Available Topics
          </div>
          {categories.map(cat => (
            <div 
              key={cat} 
              className={`topic-item ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentQuestionIdx(0);
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  background: selectedCategory === cat ? '#fff' : 'var(--accent)',
                  opacity: selectedCategory === cat ? 1 : 0.6
                }}></span>
                <span style={{ fontSize: '15px', fontWeight: '600' }}>{cat}</span>
              </div>
              <span style={{ fontSize: '11px', color: selectedCategory === cat ? '#fff' : 'var(--text3)', opacity: 0.8 }}>
                {aptitudeData[cat].length} Qs
              </span>
            </div>
          ))}
        </div>

        {/* Middle: Questions */}
        <div className="aptitude-main">
          {questions.map((q, idx) => (
            <div 
              key={q.id} 
              id={`question-${idx}`}
              className="card" 
              style={{ 
                marginBottom: 24, 
                padding: '32px',
                border: userAnswers[q.id] !== undefined 
                  ? (userAnswers[q.id] === q.answer ? '1px solid var(--success)' : '1px solid var(--danger)')
                  : '1px solid var(--border)'
              }}
            >
              <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <div className="number-badge" style={{ background: userAnswers[q.id] !== undefined ? (userAnswers[q.id] === q.answer ? 'var(--success)' : 'var(--danger)') : 'var(--accent)' }}>
                  {idx + 1}
                </div>
                <h3 style={{ fontSize: '18px', lineHeight: '1.6', fontWeight: '600' }}>{q.question}</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {q.options.map((opt, oi) => {
                  const isSelected = userAnswers[q.id] === oi;
                  const isCorrect = oi === q.answer;
                  const alreadyAnswered = userAnswers[q.id] !== undefined;

                  let bColor = 'var(--bg2)';
                  let borderColor = 'var(--border)';
                  let textColor = 'var(--text2)';

                  if (alreadyAnswered) {
                    if (isCorrect) {
                      bColor = 'rgba(16, 185, 129, 0.1)';
                      borderColor = 'var(--success)';
                      textColor = 'var(--success)';
                    } else if (isSelected) {
                      bColor = 'rgba(239, 68, 68, 0.1)';
                      borderColor = 'var(--danger)';
                      textColor = 'var(--danger)';
                    }
                  } else if (isSelected) {
                    borderColor = 'var(--accent)';
                    textColor = 'white';
                  }

                  return (
                    <button
                      key={oi}
                      onClick={() => handleAnswer(q.id, oi)}
                      className="option-btn"
                      style={{
                        background: bColor,
                        borderColor: borderColor,
                        color: textColor,
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        width: '100%',
                        margin: 0,
                        opacity: alreadyAnswered && !isSelected && !isCorrect ? 0.6 : 1
                      }}
                    >
                      <div style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        border: '2px solid currentColor',
                        marginRight: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: '800'
                      }}>
                        {String.fromCharCode(65 + oi)}
                      </div>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {showExplanation[q.id] && (
                <div className={`explanation-card fade-in ${userAnswers[q.id] === q.answer ? '' : 'wrong'}`}>
                  <div style={{ fontWeight: '700', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {userAnswers[q.id] === q.answer ? '✅ Correct Answer!' : '❌ Incorrect Answer'}
                  </div>
                  <div style={{ color: 'var(--text2)', marginBottom: 12 }}>
                    The correct answer is <strong>Option {String.fromCharCode(65 + q.answer)}</strong>.
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Explanation:</div>
                    {q.explanation}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Sidebar: Palette */}
        <div className="aptitude-right">
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: 16 }}>Overview</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--success)' }}>{stats.correct}</div>
                <div style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase' }}>Correct</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--danger)' }}>{stats.wrong}</div>
                <div style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase' }}>Wrong</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text3)' }}>{stats.unvisited}</div>
                <div style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase' }}>Unvisited</div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Question Palette
              <button 
                onClick={() => {
                  setUserAnswers({});
                  setShowExplanation({});
                  setCurrentQuestionIdx(0);
                }}
                className="btn-sm btn-secondary" 
                style={{ padding: '2px 8px', fontSize: '10px' }}
              >
                Reset
              </button>
            </div>
            <div className="palette-grid">
              {questions.map((q, idx) => (
                <div 
                  key={idx} 
                  className={`palette-box ${userAnswers[q.id] !== undefined ? 'answered' : ''} ${currentQuestionIdx === idx ? 'current' : ''}`}
                  onClick={() => scrollToQuestion(idx)}
                >
                  {idx + 1}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--card2)', padding: '16px', borderRadius: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text3)', marginBottom: 8 }}>PRO TIP</div>
            <div style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.5' }}>
              Solving topic-wise helps in identifying strong and weak areas. Focus on accuracy first!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
