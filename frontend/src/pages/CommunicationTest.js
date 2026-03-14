import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import { Headphones, Mic, BookOpen, PenTool, CheckCircle, RefreshCcw, AlertTriangle } from 'lucide-react';
import ListeningSkill from '../components/lsrw/ListeningSkill';
import SpeakingSkill from '../components/lsrw/SpeakingSkill';
import ReadingSkill from '../components/lsrw/ReadingSkill';
import WritingSkill from '../components/lsrw/WritingSkill';

const FALLBACK_DATA = {
  listening: [
    { id: 'l1', prompt: 'Listen to the instruction and choose the correct action.', text: 'Please submit the project report by Friday afternoon to the department head.', options: ['Submit on Monday', 'Submit on Friday afternoon', 'Submit to the manager', 'Email it today'], answer: 1 },
    { id: 'l2', prompt: 'What did the speaker mention as a priority?', text: 'Our primary focus this quarter is customer satisfaction and reducing response times.', options: ['Increasing sales', 'Reducing costs', 'Customer satisfaction', 'New product launch'], answer: 2 }
  ],
  speaking: [
    { id: 's1', prompt: 'Introduce yourself in 3 sentences focus on your skills.', hints: ['Greet', 'Mention degree', 'Highlight 2 skills'] },
    { id: 's2', prompt: 'How would you handle a conflict with a colleague?', hints: ['Stay calm', 'Direct communication', 'Seek solution'] }
  ],
  reading: [
    { id: 'r1', prompt: 'Read the passage and answer: What is the main benefit of AI in healthcare?', passage: 'Artificial Intelligence is revolutionizing healthcare by providing faster diagnoses and personalized treatment plans. It helps doctors analyze vast amounts of data in seconds.', options: ['Cheaper medicine', 'Faster diagnoses', 'More doctors', 'Better hospitals'], answer: 1 },
    { id: 'r2', prompt: 'Read the passage and answer: What should you do before an interview?', passage: 'Preparation is key to a successful interview. Research the company, practice common questions, and dress professionally to make a good first impression.', options: ['Arrive late', 'Research the company', 'Buy new shoes', 'Ignore company history'], answer: 1 }
  ],
  writing: [
    { id: 'w1', type: 'email', prompt: 'Write a professional email to your manager requesting 2 days of leave for a personal emergency.', hints: ['Use formal salutation', 'State reason briefly', 'Mention dates clearly', 'Express willingness to complete pending work'] },
    { id: 'w2', type: 'pitch', prompt: 'Write a short 2-sentence pitch for a web application project you built.', hints: ['Problem solved', 'Tech stack used'] }
  ]
};

export default function CommunicationTest() {
  const [data, setData] = useState(FALLBACK_DATA);
  const [activeTab, setActiveTab] = useState('listening');
  const [answers, setAnswers] = useState({});
  const [writingInputs, setWritingInputs] = useState({});
  const [speechTranscripts, setSpeechTranscripts] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [scores, setScores] = useState({ listening: 0, speaking: 0, reading: 0, writing: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/tests/communication')
      .then(r => {
        if (r.data && Object.keys(r.data).some(k => r.data[k]?.length > 0)) {
          setData(prev => ({
            listening: r.data.listening?.length ? r.data.listening : prev.listening,
            speaking: r.data.speaking?.length ? r.data.speaking : prev.speaking,
            reading: r.data.reading?.length ? r.data.reading : prev.reading,
            writing: r.data.writing?.length ? r.data.writing : prev.writing
          }));
        }
      })
      .catch(e => console.error('Error fetching communication data:', e))
      .finally(() => setLoading(false));
  }, []);

  const calculateScores = () => {
    const newScores = { listening: 0, speaking: 0, reading: 0, writing: 0 };
    
    // Listening
    let lCorrect = 0;
    (data.listening || []).forEach(q => { if (answers[q.id] === q.answer) lCorrect++; });
    newScores.listening = data.listening.length ? (lCorrect / data.listening.length) * 10 : 0;

    // Reading
    let rCorrect = 0;
    (data.reading || []).forEach(q => { if (answers[q.id] === q.answer) rCorrect++; });
    newScores.reading = data.reading.length ? (rCorrect / data.reading.length) * 10 : 0;

    // Writing
    let wScore = 0;
    (data.writing || []).forEach(q => {
      const input = writingInputs[q.id] || '';
      let qPoints = 0;
      if (input.length > 50) qPoints += 5;
      if (q.hints && q.hints.some(h => input.toLowerCase().includes(h.toLowerCase()))) qPoints += 5;
      wScore += qPoints;
    });
    newScores.writing = data.writing.length ? (wScore / (data.writing.length * 10)) * 10 : 0;

    // Speaking (Based on transcripts)
    let sScore = 0;
    (data.speaking || []).forEach(q => {
      const transcript = speechTranscripts[q.id] || '';
      let qPoints = 0;
      if (transcript.length > 30) qPoints += 5;
      if (q.hints && q.hints.some(h => transcript.toLowerCase().includes(h.toLowerCase()))) qPoints += 5;
      sScore += qPoints;
    });
    newScores.speaking = data.speaking.length ? (sScore / (data.speaking.length * 10)) * 10 : 0;
    if (newScores.speaking === 0 && Object.keys(speechTranscripts).length === 0) newScores.speaking = 5; // Base score if attempted but failed

    return newScores;
  };

  const handleSubmit = async () => {
    const finalScores = calculateScores();
    setScores(finalScores);
    setSubmitted(true);
    const avg = Object.values(finalScores).reduce((a, b) => a + b, 0) / 4;
    try {
      await API.post('/tests/submit', {
        test_type: 'communication',
        score: avg,
        total: 10,
        details: { lsrw_scores: finalScores }
      });
    } catch (e) { console.error('Error submitting test:', e); }
  };

  const tabs = [
    { id: 'listening', label: 'Listening', icon: <Headphones size={20} /> },
    { id: 'speaking', label: 'Speaking', icon: <Mic size={20} /> },
    { id: 'reading', label: 'Reading', icon: <BookOpen size={20} /> },
    { id: 'writing', label: 'Writing', icon: <PenTool size={20} /> },
  ];

  const currentQuestions = data[activeTab] || [];

  return (
    <div className="content-area fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 className="section-title">🗣️ LSRW Communication Module</h1>
        <p className="section-sub">Practice Listening, Speaking, Reading, and Writing to master your communication skills</p>
      </div>

      {!submitted ? (
        <>
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ display: 'flex', background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    padding: '16px 20px',
                    border: 'none',
                    background: activeTab === tab.id ? 'var(--card-bg)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--accent)' : 'var(--text2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent'
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ padding: 24 }}>
              {currentQuestions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>
                  <AlertTriangle size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                  <p>No questions currently loaded for this section.</p>
                </div>
              ) : (
                <>
                  {activeTab === 'listening' && (
                    <ListeningSkill
                      questions={data.listening}
                      answers={answers}
                      onAnswer={(qid, oid) => setAnswers({ ...answers, [qid]: oid })}
                      submitted={submitted}
                    />
                  )}

                  {activeTab === 'speaking' && (
                    <SpeakingSkill 
                      questions={data.speaking} 
                      transcripts={speechTranscripts}
                      onTranscriptChange={(qid, text) => setSpeechTranscripts({...speechTranscripts, [qid]: text})}
                      submitted={submitted}
                    />
                  )}

                  {activeTab === 'reading' && (
                    <ReadingSkill
                      questions={data.reading}
                      answers={answers}
                      onAnswer={(qid, oid) => setAnswers({ ...answers, [qid]: oid })}
                      submitted={submitted}
                    />
                  )}

                  {activeTab === 'writing' && (
                    <WritingSkill
                      questions={data.writing}
                      inputs={writingInputs}
                      onInputChange={(qid, val) => setWritingInputs({ ...writingInputs, [qid]: val })}
                      submitted={submitted}
                    />
                  )}
                </>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button className="btn btn-primary btn-lg" onClick={handleSubmit} style={{ gap: 8 }}>
              <CheckCircle size={20} /> Complete LSRW Assessment
            </button>
          </div>
        </>
      ) : (
        <div className="card fade-in" style={{ textAlign: 'center', background: 'var(--bg2)', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🏆</div>
          <h2 style={{ marginBottom: 12 }}>Assessment Completed!</h2>
          <p style={{ color: 'var(--text2)', marginBottom: 32 }}>Review your performance and correct answers below.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 32 }}>
            {Object.entries(scores).map(([key, val]) => (
              <div key={key} style={{ background: 'var(--card-bg)', padding: 20, borderRadius: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ textTransform: 'capitalize', color: 'var(--text3)', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', marginBottom: 10 }}>{key}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)' }}>{val.toFixed(1)}<span style={{ fontSize: 14, color: 'var(--text3)', fontWeight: 400 }}> / 10</span></div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'left', marginBottom: 32 }}>
            <h4 style={{ marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>Detailed Review</h4>
            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: 10 }}>
              <ListeningSkill questions={data.listening} answers={answers} submitted={true} />
              <div className="divider" />
              <ReadingSkill questions={data.reading} answers={answers} submitted={true} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => { setSubmitted(false); setAnswers({}); setWritingInputs({}); setSpeechTranscripts({}); }}>
              <RefreshCcw size={18} style={{ marginRight: 8 }} /> Retake Assessment
            </button>
            <button className="btn btn-primary" onClick={() => window.location.href='/dashboard'}>
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
