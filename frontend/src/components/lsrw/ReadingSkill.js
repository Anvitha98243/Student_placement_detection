import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function ReadingSkill({ questions, answers, onAnswer, submitted }) {
  return (
    <div className="fade-in">
      <h3 style={{ marginBottom: 20, color: 'var(--text1)' }}>📖 Reading Comprehension</h3>
      {(questions || []).map((q, i) => (
        <div key={q.id} className="question-card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div className="number-badge">{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ background: 'var(--bg)', padding: 16, borderRadius: 8, marginBottom: 16, fontStyle: 'italic', borderLeft: '4px solid var(--accent)' }}>
                "{q.passage}"
              </div>
              <p className="question-text">{q.prompt}</p>
            </div>
          </div>
          <div style={{ paddingLeft: 44 }}>
            {q.options.map((opt, oi) => {
              const isSelected = answers[q.id] === oi;
              const isCorrect = q.answer === oi;
              
              let statusClass = '';
              if (submitted) {
                if (isCorrect) statusClass = 'correct';
                else if (isSelected) statusClass = 'wrong';
              } else if (isSelected) {
                statusClass = 'selected';
              }

              return (
                <button
                  key={oi}
                  className={`option-btn ${statusClass}`}
                  onClick={() => !submitted && onAnswer(q.id, oi)}
                  disabled={submitted}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  {opt}
                  {submitted && isCorrect && <CheckCircle2 size={16} color="var(--success)" />}
                  {submitted && isSelected && !isCorrect && <XCircle size={16} color="var(--danger)" />}
                </button>
              );
            })}
          </div>
          {submitted && (
            <div style={{ paddingLeft: 44, marginTop: 12, fontSize: 13, color: 'var(--text2)', background: 'rgba(16, 185, 129, 0.05)', padding: 10, borderRadius: 8 }}>
              <strong>Rationale:</strong> The passage explicitly identifies AI's role in providing "faster diagnoses" by analyzing vast data.
            </div>
          )}
        </div>
      ))}
    </div>
  );
}