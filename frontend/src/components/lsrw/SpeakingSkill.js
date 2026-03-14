import React, { useState, useEffect } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

export default function SpeakingSkill({ questions, transcripts, onTranscriptChange, submitted }) {
  const [isRecording, setIsRecording] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [recognition, setRecognition] = useState(null);

  const analyzeTranscript = (text, hints) => {
    if (!text || text.length < 5) return null;

    const issues = [];
    const suggestions = [];
    let score = 0;

    // Basic Grammar & Professionalism Heuristics
    if (text.length < 30) issues.push("Response is too brief. Try to elaborate more.");
    else score += 4;

    const keywords = hints.map(h => h.toLowerCase());
    const usedKeywords = keywords.filter(k => text.toLowerCase().includes(k));
    score += (usedKeywords.length / keywords.length) * 6;

    if (usedKeywords.length < keywords.length / 2) {
      issues.push(`Try to include more key points like: ${keywords.join(', ')}.`);
    }

    if (!/^[A-Z]/.test(text)) suggestions.push("Start with a confident, clear opening.");
    if (text.split(' ').length > 20 && !text.includes(',')) suggestions.push("Use pauses and varied sentence structures.");

    // Simple "Better Version" Generator
    let betterVersion = text;
    if (text.toLowerCase().includes("i am")) betterVersion = betterVersion.replace(/i am/gi, "I am currently");
    if (text.toLowerCase().includes("like")) betterVersion = betterVersion.replace(/like/gi, "such as");
    
    return {
      score: Math.min(score, 10).toFixed(1),
      status: score > 7 ? 'Excellent' : score > 4 ? 'Satisfactory' : 'Needs Improvement',
      issues,
      suggestions,
      betterVersion: betterVersion.charAt(0).toUpperCase() + betterVersion.slice(1) + "."
    };
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        if (activeQuestion !== null) {
          onTranscriptChange(activeQuestion, transcript);
        }
      };

      rec.onend = () => setIsRecording(false);
      setRecognition(rec);
    }
  }, [activeQuestion]);

  const startRecording = (qid) => {
    if (!recognition) return alert("Speech recognition not supported in this browser.");
    setActiveQuestion(qid);
    setIsRecording(true);
    recognition.start();
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="fade-in">
      <h3 style={{ marginBottom: 20, color: 'var(--text1)' }}>🎙️ Speaking Practice</h3>
      <p style={{ color: 'var(--text2)', marginBottom: 20, fontSize: 14 }}>Click record and speak the response clearly into your microphone.</p>
      
      {(questions || []).map((q, i) => (
        <div key={q.id} className="question-card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div className="number-badge">{i + 1}</div>
            <div style={{ flex: 1 }}>
              <p className="question-text">{q.prompt}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                {q.hints.map(h => <span key={h} className="badge badge-info">{h}</span>)}
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg2)', padding: 20, borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              {isRecording && activeQuestion === q.id ? (
                <button className="btn btn-danger" onClick={stopRecording} style={{ gap: 8 }}>
                  <Square size={18} fill="white" /> Stop Recording
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  onClick={() => startRecording(q.id)} 
                  disabled={submitted || (isRecording && activeQuestion !== q.id)}
                  style={{ gap: 8 }}
                >
                  <Mic size={18} /> {transcripts[q.id] ? "Redo Recording" : "Start Recording"}
                </button>
              )}
            </div>

            {isRecording && activeQuestion === q.id && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--accent)', marginBottom: 12 }}>
                <Loader2 size={16} className="spinner" />
                <span style={{ fontSize: 12, fontWeight: 600 }}>Listening...</span>
              </div>
            )}

            <div style={{ 
              background: 'var(--bg)', 
              padding: 16, 
              borderRadius: 8, 
              minHeight: 80, 
              fontSize: 14, 
              color: transcripts[q.id] ? 'var(--text)' : 'var(--text3)',
              border: '1px solid var(--border)',
              lineHeight: 1.6
            }}>
              {transcripts[q.id] || "Your speech transcript will appear here..."}
            </div>

            {submitted && transcripts[q.id] && (() => {
              const analysis = analyzeTranscript(transcripts[q.id], q.hints);
              if (!analysis) return null;
              return (
                <div className="fade-in" style={{ marginTop: 20, padding: 16, background: 'rgba(99, 102, 241, 0.05)', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>AI Feedback Advisor</h4>
                    <span className={`badge ${analysis.score > 7 ? 'badge-success' : 'badge-warning'}`}>{analysis.status}</span>
                  </div>
                  
                  {analysis.issues.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--danger)', marginBottom: 4 }}>Improvements needed:</p>
                      <ul style={{ paddingLeft: 18, fontSize: 12, color: 'var(--text2)' }}>
                        {analysis.issues.map((pt, idx) => <li key={idx}>{pt}</li>)}
                      </ul>
                    </div>
                  )}

                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)', marginBottom: 4 }}>Better Professional Version:</p>
                    <div style={{ fontSize: 13, background: 'var(--bg)', padding: 10, borderRadius: 6, border: '1px solid var(--border)', fontStyle: 'italic' }}>
                      "{analysis.betterVersion}"
                    </div>
                  </div>

                  {analysis.suggestions.length > 0 && (
                    <p style={{ fontSize: 11, color: 'var(--text3)' }}>
                      <strong>Tip:</strong> {analysis.suggestions[0]}
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      ))}
    </div>
  );
}