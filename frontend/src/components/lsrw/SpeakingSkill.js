import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Loader2, BarChart3, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function SpeakingSkill({ questions, transcripts, onTranscriptChange, submitted }) {
  const [isRecording, setIsRecording] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  const analyzeTranscript = (text, hints) => {
    if (!text || text.length < 5) return null;

    const issues = [];
    const strengths = [];
    const suggestions = [];
    let score = 0;

    // 1. Length & Fluency Analysis
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    
    if (wordCount < 10) {
      issues.push("Response is too brief. Try to speak for at least 30 seconds.");
      score += 2;
    } else if (wordCount < 40) {
      score += 5;
    } else {
      strengths.push("Good response length and detail.");
      score += 8;
    }

    // 2. Keyword/Hint Integration
    const keywords = hints.map(h => h.toLowerCase());
    const usedKeywords = keywords.filter(k => text.toLowerCase().includes(k));
    const keywordScore = (usedKeywords.length / keywords.length) * 10;
    
    if (usedKeywords.length === keywords.length) {
      strengths.push("Excellent coverage of all key points.");
      score += 2;
    } else if (usedKeywords.length >= keywords.length / 2) {
      score += 1;
    } else {
      suggestions.push(`Try to incorporate more specific points: ${keywords.join(', ')}.`);
    }

    // 3. Filler Word Detection
    const fillers = ['um', 'uh', 'like', 'actually', 'basically', 'you know'];
    const foundFillers = fillers.filter(f => text.toLowerCase().includes(f));
    if (foundFillers.length > 2) {
      issues.push("Avoid using filler words like 'um' or 'like' to sound more confident.");
    } else {
      strengths.push("Clear and fluent delivery with minimal fillers.");
    }

    // 4. Grammar & Confidence
    if (!/^[A-Z]/.test(text)) {
      suggestions.push("Focus on a strong, clear opening statement.");
    }
    
    // Heuristic Scores for display
    const fluency = Math.min(10, (wordCount / 50) * 10).toFixed(1);
    const vocabulary = Math.min(10, (usedKeywords.length / keywords.length) * 10 + 2).toFixed(1);

    // Simple Professional Refinement
    let professionalVersion = text
      .replace(/\bi am\b/gi, "I am currently")
      .replace(/\bi want\b/gi, "I aim")
      .replace(/\bi like\b/gi, "I am passionate about")
      .replace(/\bgood\b/gi, "exceptional")
      .replace(/\bwork\b/gi, "contribute");

    return {
      score: Math.min(score, 10).toFixed(1),
      metrics: {
        fluency,
        vocabulary,
        relevance: ((usedKeywords.length / keywords.length) * 10).toFixed(1)
      },
      status: score >= 8 ? 'Excellent' : score >= 5 ? 'Satisfactory' : 'Needs Focus',
      issues,
      strengths,
      suggestions,
      betterVersion: professionalVersion.charAt(0).toUpperCase() + professionalVersion.slice(1) + (text.endsWith('.') ? '' : '.')
    };
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

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

    rec.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      if (event.error === 'not-allowed') {
        setError("Microphone access denied. Please allow microphone permissions.");
      } else {
        setError(`Error: ${event.error}`);
      }
      setIsRecording(false);
    };

    rec.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = rec;

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [activeQuestion]);

  const toggleRecording = (qid) => {
    if (!recognitionRef.current) return;

    if (isRecording && activeQuestion === qid) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setError(null);
      setActiveQuestion(qid);
      setIsRecording(true);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Start error:", e);
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current.start(), 100);
      }
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ color: 'var(--text1)', marginBottom: 4 }}>🎙️ Speaking Proficiency</h3>
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>AI-powered speech analysis and transcription.</p>
        </div>
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '8px 12px', borderRadius: 8, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}
      </div>

      {(questions || []).map((q, i) => (
        <div key={q.id} className="question-card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div className="number-badge">{i + 1}</div>
            <div style={{ flex: 1 }}>
              <p className="question-text" style={{ fontSize: 16, fontWeight: 600 }}>{q.prompt}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                {q.hints.map(h => (
                  <span key={h} className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg2)', padding: 24, borderRadius: 16, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <button
                className={`btn ${isRecording && activeQuestion === q.id ? 'btn-danger' : 'btn-primary'}`}
                onClick={() => toggleRecording(q.id)}
                disabled={submitted || (isRecording && activeQuestion !== q.id)}
                style={{ height: 54, padding: '0 24px', borderRadius: 27, gap: 10, fontSize: 16, fontWeight: 700, boxShadow: isRecording && activeQuestion === q.id ? '0 0 20px rgba(239, 68, 68, 0.3)' : 'var(--shadow-md)' }}
              >
                {isRecording && activeQuestion === q.id ? (
                  <><Square size={20} fill="white" /> Finish Speaking</>
                ) : (
                  <><Mic size={20} /> {transcripts[q.id] ? "Try Again" : "Start Recording"}</>
                )}
              </button>
              
              {isRecording && activeQuestion === q.id && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="recording-ripple"></div>
                  <span style={{ fontSize: 13, color: 'var(--danger)', fontWeight: 700, letterSpacing: '0.05em' }}>RECORDING LIVE...</span>
                </div>
              )}
            </div>

            <div style={{
              background: 'var(--bg)',
              padding: 20,
              borderRadius: 12,
              minHeight: 100,
              fontSize: 15,
              color: transcripts[q.id] ? 'var(--text1)' : 'var(--text3)',
              border: '2px dashed var(--border)',
              lineHeight: 1.6,
              transition: 'all 0.3s'
            }}>
              {transcripts[q.id] || "Your words will appear here as you speak..."}
            </div>

            {transcripts[q.id] && (() => {
              const analysis = analyzeTranscript(transcripts[q.id], q.hints);
              if (!analysis) return null;
              return (
                <div className="fade-in" style={{ marginTop: 24 }}>
                  <div style={{ 
                    background: 'var(--card-bg)', 
                    borderRadius: 16, 
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Sparkles size={18} color="var(--accent)" />
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text1)' }}>AI Speech Analysis</h4>
                      </div>
                      <span className={`badge ${analysis.score >= 8 ? 'badge-success' : analysis.score >= 5 ? 'badge-warning' : 'badge-danger'}`}>
                        {analysis.status}
                      </span>
                    </div>

                    <div style={{ padding: 20 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, marginBottom: 4 }}>FLUENCY</div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)' }}>{analysis.metrics.fluency}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, marginBottom: 4 }}>VOCAB</div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)' }}>{analysis.metrics.vocabulary}</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, marginBottom: 4 }}>RELEVANCE</div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)' }}>{analysis.metrics.relevance}</div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle2 size={14} /> Strengths
                          </p>
                          <ul style={{ paddingLeft: 16, fontSize: 12, color: 'var(--text2)', margin: 0 }}>
                            {analysis.strengths.map((s, idx) => <li key={idx} style={{ marginBottom: 4 }}>{s}</li>)}
                          </ul>
                        </div>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--danger)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <AlertCircle size={14} /> Improvements
                          </p>
                          <ul style={{ paddingLeft: 16, fontSize: 12, color: 'var(--text2)', margin: 0 }}>
                            {analysis.issues.concat(analysis.suggestions).map((item, idx) => <li key={idx} style={{ marginBottom: 4 }}>{item}</li>)}
                          </ul>
                        </div>
                      </div>

                      <div style={{ background: 'var(--bg2)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Recommended Response</p>
                        <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>
                          "{analysis.betterVersion}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      ))}
      
      <style>{`
        .recording-ripple {
          width: 8px;
          height: 8px;
          background: var(--danger);
          border-radius: 50%;
          animation: ripple 1.5s infinite;
        }
        @keyframes ripple {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>
  );
}