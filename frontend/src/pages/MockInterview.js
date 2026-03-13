import React, { useState, useRef, useEffect } from 'react';

const INTERVIEW_TYPES = [
  { id: 'product', label: '🏢 Product Company', desc: 'Google, Microsoft, Amazon style', color: '#6366f1' },
  { id: 'service', label: '🏗️ Service Company', desc: 'TCS, Infosys, Wipro style', color: '#10b981' },
  { id: 'startup', label: '🚀 Startup', desc: 'Fast-paced, full-stack focus', color: '#f59e0b' },
  { id: 'banking', label: '🏦 Banking / Finance', desc: 'BFSI sector focus', color: '#3b82f6' },
];

const ROUNDS = ['HR Round', 'Technical Round', 'Managerial Round'];

// Round-specific system prompts
const getRoundConfig = (interviewType, round) => {
  const company = interviewType?.label?.replace(/[^\w\s]/g, '').trim() || 'tech';

  const configs = {
    'HR Round': {
      topics: 'personal background, career goals, strengths/weaknesses, team fit, work style, motivation, salary expectations, and behavioral questions',
      questionStyle: 'behavioral and situational (STAR method expected)',
      examples: 'Tell me about yourself, Why do you want to join us, Where do you see yourself in 5 years, Describe a challenge you faced',
      scoringCriteria: 'communication clarity, confidence, self-awareness, cultural fit, enthusiasm',
    },
    'Technical Round': {
      topics: interviewType?.id === 'banking'
        ? 'SQL, data analysis, financial systems, core Java/Python, algorithms, banking domain knowledge, REST APIs'
        : interviewType?.id === 'service'
        ? 'core Java/Python, SQL, OOPS concepts, basic DSA, system design basics, common frameworks'
        : interviewType?.id === 'startup'
        ? 'full-stack development, React/Node, system design, DSA, problem-solving, agile practices, cloud basics'
        : 'data structures, algorithms, system design, problem solving, coding, OOP, complexity analysis',
      questionStyle: 'technical and problem-solving — ask them to explain concepts, write pseudocode, or solve problems step-by-step',
      examples: interviewType?.id === 'banking'
        ? 'Explain normalization, Write a SQL query for X, Difference between OLAP and OLTP'
        : 'Reverse a linked list, Explain time complexity, Design a URL shortener, Difference between stack and heap',
      scoringCriteria: 'technical accuracy, problem-solving approach, code quality, depth of knowledge',
    },
    'Managerial Round': {
      topics: 'leadership scenarios, conflict resolution, project management, decision making under pressure, cross-team collaboration, ownership mindset, prioritization',
      questionStyle: 'scenario-based and leadership-focused (STAR method, emphasize impact and ownership)',
      examples: 'Tell me about a time you led a project, How do you handle disagreements with teammates, Describe a failure and what you learned',
      scoringCriteria: 'leadership qualities, decision-making, communication, ownership, maturity',
    },
  };

  return configs[round] || configs['HR Round'];
};

const buildSystemPrompt = (interviewType, round, maxQuestions) => {
  const config = getRoundConfig(interviewType, round);
  const company = interviewType?.label?.replace(/[^\w\s]/g, '').trim() || 'tech';

  return `You are an experienced ${round} interviewer at a ${company} company. You are interviewing a fresher software engineering candidate.

THIS IS A ${round.toUpperCase()} — STRICT TOPIC FOCUS:
- Focus ONLY on: ${config.topics}
- Question style: ${config.questionStyle}
- Example questions for this round: ${config.examples}
- Score based on: ${config.scoringCriteria}

ABSOLUTE RULES:
1. Ask ONE question at a time. Never ask multiple questions together.
2. After each candidate answer, give 2-3 lines of specific feedback mentioning what was good and what to improve.
3. Include a score in EXACT format: [SCORE:X] where X is 1-10 based on ${config.scoringCriteria}
4. Then ask the NEXT question on a new line.
5. After exactly ${maxQuestions} questions answered, write "INTERVIEW_COMPLETE" followed by a 3-line overall summary.
6. Keep questions relevant to THIS SPECIFIC ROUND — do NOT mix HR questions in Technical round or vice versa.
7. Be warm, professional, and constructive in feedback.
8. Always ask the next question after giving feedback (unless interview is complete).`;
};

export default function MockInterview() {
  const [stage, setStage] = useState('setup');
  const [interviewType, setInterviewType] = useState(null);
  const [round, setRound] = useState('HR Round');
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [scores, setScores] = useState([]);
  const [finalResult, setFinalResult] = useState(null);
  const [interviewDone, setInterviewDone] = useState(false);
  const chatEndRef = useRef(null);
  const MAX_QUESTIONS = 5;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const callClaude = async (systemPrompt, conversationHistory) => {

    const token = localStorage.getItem('token');
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const res = await fetch(`${baseUrl}/claude`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: conversationHistory,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`API error: ${res.status} — ${err}`);
    }

    const data = await res.json();
    return data.content?.[0]?.text || '';
  };

  const startInterview = async () => {
    if (!interviewType) return;
    setStage('interview');
    setLoading(true);
    setMessages([]);
    setQuestionCount(0);
    setScores([]);
    setInterviewDone(false);
    setFinalResult(null);

    const systemPrompt = buildSystemPrompt(interviewType, round, MAX_QUESTIONS);

    try {
      const text = await callClaude(systemPrompt, [
        { role: 'user', content: `Start the ${round}. Greet me and ask the first question appropriate for this round.` },
      ]);
      setMessages([{ role: 'ai', text, type: 'question' }]);
      setQuestionCount(1);
    } catch (e) {
      console.error('Start interview error:', e);
      const fallback = round === 'Technical Round'
        ? `Welcome! Let's start your Technical Round. First question: Can you explain the difference between an array and a linked list?`
        : round === 'Managerial Round'
        ? `Welcome! Let's begin your Managerial Round. Tell me about a time you had to manage a difficult situation in a team project.`
        : `Welcome to your HR Round! Let's begin. Please tell me about yourself and your background.`;
      setMessages([{ role: 'ai', text: fallback, type: 'question' }]);
      setQuestionCount(1);
    }
    setLoading(false);
  };

  const sendAnswer = async () => {
    if (!userInput.trim() || loading || interviewDone) return;
    const answer = userInput.trim();
    setUserInput('');

    const newMessages = [...messages, { role: 'user', text: answer }];
    setMessages(newMessages);
    setLoading(true);

    const systemPrompt = buildSystemPrompt(interviewType, round, MAX_QUESTIONS);

    // Build conversation history for API
    const conversationHistory = newMessages.map(m => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.text,
    }));

    // Add context for current question number
    const contextNote = questionCount >= MAX_QUESTIONS
      ? `This was the final question (${MAX_QUESTIONS}/${MAX_QUESTIONS}). After giving feedback and score, write INTERVIEW_COMPLETE followed by overall summary.`
      : `This is answer ${questionCount}/${MAX_QUESTIONS}. Give feedback, score, then ask question ${questionCount + 1}.`;

    // Append context as a system hint via extra user instruction
    const historyWithHint = [
      ...conversationHistory,
      { role: 'user', content: `[System note: ${contextNote}]` },
    ];

    try {
      const text = await callClaude(systemPrompt, conversationHistory);

      // Extract score
      const scoreMatch = text.match(/\[SCORE:(\d+)\]/);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : null;

      if (score !== null) {
        setScores(prev => [...prev, score]);
      }

      const isDone = text.includes('INTERVIEW_COMPLETE');

      if (isDone) {
        setInterviewDone(true);
        const allScores = score !== null ? [...scores, score] : [...scores];
        const avg = allScores.length
          ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
          : 6;
        const summary = text
          .replace('INTERVIEW_COMPLETE', '')
          .replace(/\[SCORE:\d+\]/g, '')
          .trim();
        setFinalResult({ avg, scores: allScores, summary });
      }

      const cleanText = text
        .replace(/\[SCORE:\d+\]/g, '')
        .replace('INTERVIEW_COMPLETE', '')
        .trim();

      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          text: cleanText,
          type: isDone ? 'complete' : 'feedback',
          score,
        },
      ]);

      if (!isDone) setQuestionCount(prev => prev + 1);
    } catch (e) {
      console.error('Send answer error:', e);
      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          text: `I had trouble processing that. Could you please repeat your answer? (Error: ${e.message})`,
          type: 'error',
        },
      ]);
    }
    setLoading(false);
  };

  const getScoreColor = (s) => s >= 8 ? '#10b981' : s >= 6 ? '#f59e0b' : '#ef4444';
  const getScoreLabel = (s) => s >= 8 ? 'Excellent' : s >= 6 ? 'Good' : s >= 4 ? 'Average' : 'Needs Work';

  // ─── SETUP SCREEN ────────────────────────────────────────────────────────────
  if (stage === 'setup') return (
    <div className="content-area fade-in">
      <h1 className="section-title">🤖 AI Mock Interview</h1>
      <p className="section-sub">Practice with an AI interviewer and get instant feedback on every answer</p>

      <div className="card" style={{ maxWidth: 700, margin: '0 auto' }}>
        <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: 6 }}>Select Company Type</h3>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 20 }}>Each type has different question styles and expectations</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {INTERVIEW_TYPES.map(t => (
            <div key={t.id} onClick={() => setInterviewType(t)}
              style={{
                padding: '16px 18px', borderRadius: 12, cursor: 'pointer',
                border: `2px solid ${interviewType?.id === t.id ? t.color : 'var(--border)'}`,
                background: interviewType?.id === t.id ? `${t.color}15` : 'var(--bg)',
                transition: 'all 0.2s',
              }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{t.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>{t.desc}</div>
              {interviewType?.id === t.id && (
                <div style={{ marginTop: 8, fontSize: 11, color: t.color, fontWeight: 700 }}>✓ Selected</div>
              )}
            </div>
          ))}
        </div>

        <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: 6 }}>Select Round</h3>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 12 }}>Each round has its own focused question set</p>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {ROUNDS.map(r => (
            <button key={r} onClick={() => setRound(r)}
              style={{
                flex: 1, padding: '10px 8px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                cursor: 'pointer',
                border: `1px solid ${round === r ? 'var(--accent)' : 'var(--border)'}`,
                background: round === r ? 'rgba(99,102,241,0.15)' : 'var(--bg)',
                color: round === r ? 'var(--accent)' : 'var(--text2)',
                fontFamily: 'Outfit, sans-serif',
              }}>
              {r}
            </button>
          ))}
        </div>

        {/* Round description */}
        <div style={{ background: 'var(--bg2)', borderRadius: 10, padding: '12px 14px', marginBottom: 20, fontSize: 12, color: 'var(--text3)', lineHeight: 1.7 }}>
          {round === 'HR Round' && <><strong style={{ color: 'var(--text2)' }}>HR Round focuses on:</strong> Personal background, career goals, strengths/weaknesses, cultural fit, behavioral questions (STAR method)</>}
          {round === 'Technical Round' && <><strong style={{ color: 'var(--text2)' }}>Technical Round focuses on:</strong> DSA, coding concepts, system design, OOP, SQL/databases, frameworks relevant to the selected company type</>}
          {round === 'Managerial Round' && <><strong style={{ color: 'var(--text2)' }}>Managerial Round focuses on:</strong> Leadership, conflict resolution, project ownership, decision-making, team collaboration scenarios</>}
        </div>

        <div style={{ background: 'var(--bg2)', borderRadius: 12, padding: 16, marginBottom: 24, fontSize: 13 }}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>📋 How it works:</div>
          <div style={{ color: 'var(--text2)', lineHeight: 1.8 }}>
            • AI asks you <strong>{MAX_QUESTIONS} questions</strong> tailored to the selected round<br />
            • You type your answers naturally<br />
            • AI gives <strong>instant feedback + score</strong> after each answer<br />
            • Get a <strong>final score and report</strong> at the end
          </div>
        </div>

        <button className="btn btn-primary"
          style={{ width: '100%', padding: 14, fontSize: 16 }}
          onClick={startInterview}
          disabled={!interviewType}>
          🚀 Start {round}
        </button>
      </div>
    </div>
  );

  // ─── INTERVIEW SCREEN ─────────────────────────────────────────────────────────
  return (
    <div className="content-area fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 className="section-title">🤖 AI Mock Interview</h1>
          <p className="section-sub">
            {interviewType?.label} — <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{round}</span> — Question {Math.min(questionCount, MAX_QUESTIONS)}/{MAX_QUESTIONS}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {scores.length > 0 && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)' }}>
                {Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}/10
              </div>
              <div style={{ fontSize: 10, color: 'var(--text3)' }}>Avg Score</div>
            </div>
          )}
          <button className="btn btn-secondary" onClick={() => setStage('setup')}>← Change Setup</button>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>
          <span>Interview Progress — {round}</span>
          <span>{Math.min(questionCount, MAX_QUESTIONS)}/{MAX_QUESTIONS} questions</span>
        </div>
        <div style={{ height: 6, background: 'var(--bg2)', borderRadius: 10 }}>
          <div style={{
            height: '100%', borderRadius: 10,
            background: 'linear-gradient(90deg, var(--accent), #8b5cf6)',
            width: `${(Math.min(questionCount, MAX_QUESTIONS) / MAX_QUESTIONS) * 100}%`,
            transition: 'width 0.5s',
          }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 20, alignItems: 'start' }}>
        {/* Chat Window */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ height: 420, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: m.role === 'ai' ? 'var(--accent)' : 'var(--bg2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, flexShrink: 0,
                }}>
                  {m.role === 'ai' ? '🤖' : '👤'}
                </div>
                <div style={{ maxWidth: '75%' }}>
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: m.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    background: m.role === 'user' ? 'var(--accent)' : 'var(--bg2)',
                    color: m.role === 'user' ? 'white' : 'var(--text)',
                    fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                  }}>
                    {m.text}
                  </div>
                  {m.score != null && (
                    <div style={{ marginTop: 6, display: 'flex', gap: 6, alignItems: 'center', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        color: getScoreColor(m.score),
                        background: `${getScoreColor(m.score)}22`,
                        padding: '3px 10px', borderRadius: 20,
                      }}>
                        Score: {m.score}/10 — {getScoreLabel(m.score)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🤖</div>
                <div style={{ padding: '12px 16px', borderRadius: '4px 16px 16px 16px', background: 'var(--bg2)', display: 'flex', gap: 6, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)',
                      animation: `bounce 1s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input area */}
          {!interviewDone ? (
            <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
              <textarea
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAnswer(); } }}
                placeholder={`Type your ${round} answer... (Enter to send, Shift+Enter for new line)`}
                rows={2}
                disabled={loading || interviewDone}
                style={{
                  flex: 1, background: 'var(--bg)', color: 'var(--text)',
                  border: '1px solid var(--border)', borderRadius: 10,
                  padding: '10px 14px', fontSize: 13,
                  fontFamily: 'Outfit, sans-serif', resize: 'none', outline: 'none',
                }}
              />
              <button
                onClick={sendAnswer}
                disabled={loading || !userInput.trim() || interviewDone}
                style={{
                  padding: '0 20px', borderRadius: 10, border: 'none',
                  background: 'var(--accent)', color: 'white', fontSize: 18,
                  cursor: 'pointer', opacity: loading || !userInput.trim() ? 0.5 : 1,
                }}>
                ➤
              </button>
            </div>
          ) : finalResult && (
            <div style={{ padding: 20, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>
                {finalResult.avg >= 8 ? '🏆' : finalResult.avg >= 6 ? '🎯' : '📚'}
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: getScoreColor(finalResult.avg), marginBottom: 4 }}>
                {finalResult.avg}/10 Overall
              </div>
              <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 16 }}>
                {finalResult.avg >= 8 ? 'Outstanding performance!' : finalResult.avg >= 6 ? 'Good job! Keep practicing.' : 'More practice will help.'}
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => { setStage('interview'); startInterview(); }}>🔄 Retry Same Round</button>
                <button className="btn btn-primary" onClick={() => setStage('setup')}>🎯 Try Different Round</button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: 'var(--text2)' }}>📊 Score Card</div>
            {scores.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: '20px 0' }}>
                Scores appear after each answer
              </p>
            ) : (
              scores.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: 'var(--text2)' }}>Q{i + 1}</span>
                  <div style={{ flex: 1, height: 6, background: 'var(--bg2)', borderRadius: 10, margin: '0 8px' }}>
                    <div style={{ height: '100%', borderRadius: 10, background: getScoreColor(s), width: `${s * 10}%` }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: getScoreColor(s) }}>{s}/10</span>
                </div>
              ))
            )}
          </div>

          {/* Round-specific tips */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: 'var(--text2)' }}>
              💡 {round} Tips
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.8 }}>
              {round === 'HR Round' && <>• Use STAR method<br />• Be genuine & confident<br />• Research the company<br />• Highlight soft skills<br />• Prepare salary range</>}
              {round === 'Technical Round' && <>• Think aloud always<br />• Discuss time complexity<br />• Start with brute force<br />• Clarify before coding<br />• Know your resume projects</>}
              {round === 'Managerial Round' && <>• Show ownership mindset<br />• Use real examples<br />• Quantify your impact<br />• Show conflict resolution<br />• Demonstrate leadership</>}
            </div>
          </div>

          {/* Round badge */}
          <div style={{
            background: 'var(--bg2)', borderRadius: 10, padding: '10px 14px',
            fontSize: 11, color: 'var(--text3)', textAlign: 'center',
          }}>
            <div style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>{round}</div>
            {interviewType?.label}
          </div>
        </div>
      </div>
    </div>
  );
}