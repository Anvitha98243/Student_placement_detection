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
    { id: 's1', prompt: 'Introduce yourself in 3 sentences — focus on your skills.', hints: ['Greet', 'Mention degree', 'Highlight 2 skills'] },
    { id: 's2', prompt: 'How would you handle a conflict with a colleague?', hints: ['Stay calm', 'Direct communication', 'Seek solution'] }
  ],
  reading: [
    { id: 'r1', prompt: 'What is the main benefit of AI in healthcare?', passage: 'Artificial Intelligence is revolutionising healthcare by providing faster diagnoses and personalised treatment plans. It helps doctors analyse vast amounts of data in seconds.', options: ['Cheaper medicine', 'Faster diagnoses', 'More doctors', 'Better hospitals'], answer: 1 },
    { id: 'r2', prompt: 'What should you do before an interview?', passage: 'Preparation is key to a successful interview. Research the company, practise common questions, and dress professionally to make a good first impression.', options: ['Arrive late', 'Research the company', 'Buy new shoes', 'Ignore company history'], answer: 1 }
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
      .then(r => { if (r.data && Object.keys(r.data).some(k => r.data[k]?.length > 0)) {
        setData(prev => ({
          listening: r.data.listening?.length ? r.data.listening : prev.listening,
          speaking: r.data.speaking?.length ? r.data.speaking : prev.speaking,
          reading: r.data.reading?.length ? r.data.reading : prev.reading,
          writing: r.data.writing?.length ? r.data.writing : prev.writing,
        })); } })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const calculateScores = () => {
    const s = { listening: 0, speaking: 0, reading: 0, writing: 0 };
    let lc = 0;
    (data.listening||[]).forEach(q => { if (answers[q.id] === q.answer) lc++; });
    s.listening = data.listening.length ? (lc/data.listening.length)*10 : 0;
    let rc = 0;
    (data.reading||[]).forEach(q => { if (answers[q.id] === q.answer) rc++; });
    s.reading = data.reading.length ? (rc/data.reading.length)*10 : 0;
    let ws = 0;
    (data.writing||[]).forEach(q => {
      const input = writingInputs[q.id]||''; let qp = 0;
      if (input.length>50) qp+=5;
      if (q.hints&&q.hints.some(h=>input.toLowerCase().includes(h.toLowerCase()))) qp+=5;
      ws+=qp;
    });
    s.writing = data.writing.length ? (ws/(data.writing.length*10))*10 : 0;
    let ss = 0;
    (data.speaking||[]).forEach(q => {
      const t = speechTranscripts[q.id]||''; let qp = 0;
      if (t.length>30) qp+=5;
      if (q.hints&&q.hints.some(h=>t.toLowerCase().includes(h.toLowerCase()))) qp+=5;
      ss+=qp;
    });
    s.speaking = data.speaking.length ? (ss/(data.speaking.length*10))*10 : 5;
    return s;
  };

  const handleSubmit = async () => {
    const finalScores = calculateScores();
    setScores(finalScores); setSubmitted(true);
    const avg = Object.values(finalScores).reduce((a,b)=>a+b,0)/4;
    try { await API.post('/tests/submit', { test_type:'communication', score:avg, total:10, details:{lsrw_scores:finalScores} }); }
    catch(e) { console.error(e); }
  };

  const tabs = [
    { id: 'listening', label: 'Listening', icon: <Headphones size={18} /> },
    { id: 'speaking',  label: 'Speaking',  icon: <Mic size={18} /> },
    { id: 'reading',   label: 'Reading',   icon: <BookOpen size={18} /> },
    { id: 'writing',   label: 'Writing',   icon: <PenTool size={18} /> },
  ];

  return (
    <>
      <div className="page-header-aurora">
        <div className="aurora-blob-1 aurora-blob" />
        <div className="aurora-blob-2 aurora-blob" />
        <div className="aurora-blob-3 aurora-blob" />
        <h1 className="page-title">🗣️ LSRW Communication Module</h1>
        <p className="page-subtitle">Practise Listening, Speaking, Reading, and Writing</p>
      </div>

      <div className="content-area fade-in">
        {!submitted ? (
          <>
            <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(108,99,255,0.1)' }}>
                {tabs.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    style={{
                      flex: 1, padding: '14px 16px',
                      border: 'none', background: 'transparent',
                      color: activeTab === tab.id ? 'var(--accent)' : 'var(--text2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                      borderBottom: activeTab === tab.id ? '2.5px solid var(--accent)' : '2.5px solid transparent',
                      transition: 'all 0.2s',
                    }}>
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
              <div style={{ padding: 24 }}>
                {(data[activeTab]||[]).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>
                    <AlertTriangle size={48} style={{ marginBottom: 16, opacity: 0.4 }} />
                    <p>No questions loaded for this section.</p>
                  </div>
                ) : (
                  <>
                    {activeTab === 'listening' && <ListeningSkill questions={data.listening} answers={answers} onAnswer={(qid,oid)=>setAnswers({...answers,[qid]:oid})} submitted={submitted} />}
                    {activeTab === 'speaking' && <SpeakingSkill questions={data.speaking} transcripts={speechTranscripts} onTranscriptChange={(qid,text)=>setSpeechTranscripts({...speechTranscripts,[qid]:text})} submitted={submitted} />}
                    {activeTab === 'reading' && <ReadingSkill questions={data.reading} answers={answers} onAnswer={(qid,oid)=>setAnswers({...answers,[qid]:oid})} submitted={submitted} />}
                    {activeTab === 'writing' && <WritingSkill questions={data.writing} inputs={writingInputs} onInputChange={(qid,val)=>setWritingInputs({...writingInputs,[qid]:val})} submitted={submitted} />}
                  </>
                )}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <button className="btn btn-primary btn-lg" onClick={handleSubmit} style={{ justifyContent: 'center' }}>
                <CheckCircle size={20} /> Complete LSRW Assessment
              </button>
            </div>
          </>
        ) : (
          <div className="card fade-in" style={{ textAlign: 'center', padding: 48, background: 'linear-gradient(135deg,rgba(184,240,200,0.4),rgba(196,212,255,0.4))' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🏆</div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'var(--nav-bg)', marginBottom: 8 }}>Assessment Completed!</h2>
            <p style={{ color: 'var(--text2)', marginBottom: 32 }}>Review your performance below.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 14, marginBottom: 32 }}>
              {Object.entries(scores).map(([key, val]) => (
                <div key={key} style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(8px)', padding: 18, borderRadius: 14, border: '1px solid rgba(255,255,255,0.85)' }}>
                  <div style={{ textTransform: 'capitalize', color: 'var(--text3)', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', marginBottom: 8 }}>{key}</div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--accent)' }}>
                    {val.toFixed(1)}<span style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 400 }}>/10</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'left', marginBottom: 32 }}>
              <h4 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--nav-bg)', marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid rgba(108,99,255,0.1)' }}>Detailed Review</h4>
              <div style={{ maxHeight: 360, overflowY: 'auto', paddingRight: 8 }}>
                <ListeningSkill questions={data.listening} answers={answers} submitted={true} />
                <div className="divider" />
                <ReadingSkill questions={data.reading} answers={answers} submitted={true} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-secondary"
                onClick={() => { setSubmitted(false); setAnswers({}); setWritingInputs({}); setSpeechTranscripts({}); }}>
                <RefreshCcw size={16} /> Retake
              </button>
              <button className="btn btn-primary" onClick={() => window.location.href = '/dashboard'}>
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}