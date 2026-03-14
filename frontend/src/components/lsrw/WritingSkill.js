import React from 'react';

export default function WritingSkill({ questions, inputs, onInputChange, submitted }) {
  const analyzeWriting = (text, hints) => {
    if (!text || text.length < 10) return null;
    
    let score = 0;
    const suggestions = [];
    const textLower = text.toLowerCase();

    // Evaluation Logic
    if (text.length > 100) score += 4;
    else if (text.length > 50) score += 2;
    else suggestions.push("Try to expand your response for better clarity.");

    const usedHints = hints.filter(h => textLower.includes(h.toLowerCase()));
    score += (usedHints.length / hints.length) * 6;

    if (usedHints.length < hints.length) {
      suggestions.push("Incorporate more listed hints to make it professional.");
    }

    if (!textLower.includes("thank") && !textLower.includes("regards")) {
      suggestions.push("Use formal closings for professional communication.");
    }

    return {
      score: score.toFixed(1),
      status: score > 7 ? 'Professional' : score > 4 ? 'Good' : 'Needs Work',
      suggestions,
      wordCount: text.split(/\s+/).filter(x => x).length
    };
  };

  const [analyzedState, setAnalyzedState] = React.useState({});

  const handleAnalyze = (qid) => {
    setAnalyzedState({ ...analyzedState, [qid]: true });
  };

  return (
    <div className="fade-in">
      <h3 style={{ marginBottom: 20, color: 'var(--text1)' }}>✍️ Writing Skills</h3>
      {(questions || []).map((q, i) => (
        <div key={q.id} className="question-card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div className="number-badge">{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div className="badge badge-purple" style={{ marginBottom: 8 }}>{q.type.toUpperCase()}</div>
              <p className="question-text">{q.prompt}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                {q.hints.map(h => <span key={h} className="badge badge-outline" style={{ border: '1px solid var(--border)', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>{h}</span>)}
              </div>
            </div>
          </div>
          <textarea
            className="code-editor"
            placeholder="Type your response here..."
            style={{ fontFamily: 'inherit', minHeight: 180, lineHeight: 1.6, padding: 16 }}
            value={inputs[q.id] || ''}
            onChange={(e) => !submitted && onInputChange(q.id, e.target.value)}
            disabled={submitted}
          />
          
          {!submitted && (
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => handleAnalyze(q.id)}
                disabled={!inputs[q.id] || inputs[q.id].length < 10}
              >
                Submit for Analysis
              </button>
            </div>
          )}

          {(submitted || analyzedState[q.id]) && inputs[q.id] && (() => {
            const analysis = analyzeWriting(inputs[q.id], q.hints);
            if (!analysis) return null;
            return (
              <div className="fade-in" style={{ marginTop: 20, padding: 16, background: 'rgba(139, 92, 246, 0.05)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent2)' }}>Writing Analysis</h4>
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>Words: {analysis.wordCount}</span>
                </div>
                
                {analysis.suggestions.length > 0 && (
                  <ul style={{ paddingLeft: 18, fontSize: 12, color: 'var(--text2)', marginBottom: 0 }}>
                    {analysis.suggestions.map((s, idx) => <li key={idx} style={{ marginBottom: 4 }}>{s}</li>)}
                  </ul>
                )}
              </div>
            );
          })()}
        </div>
      ))}
    </div>
  );
}