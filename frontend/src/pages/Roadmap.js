import React, { useState, useEffect } from 'react';
import API from '../utils/api';

export default function Roadmap() {
  const [profile, setProfile] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [progress, setProgress] = useState({});
  const [activeWeek, setActiveWeek] = useState(1);

  useEffect(() => {
    API.get('/profile').then(res => {
      setProfile(res.data.profile);
      setProfileLoading(false);
      const saved = localStorage.getItem('roadmap_progress');
      if (saved) setProgress(JSON.parse(saved));
      const savedRoadmap = localStorage.getItem('roadmap_data');
      if (savedRoadmap) setRoadmap(JSON.parse(savedRoadmap));
    }).catch(() => setProfileLoading(false));
  }, []);

  const toggleTask = (dayKey, taskIdx) => {
    const key = `${dayKey}_${taskIdx}`;
    const updated = { ...progress, [key]: !progress[key] };
    setProgress(updated);
    localStorage.setItem('roadmap_progress', JSON.stringify(updated));
  };

  const generateRoadmap = async () => {
    if (!profile) return;
    setLoading(true);

    const weakAreas = [];
    if ((profile.cgpa || 0) < 7.5) weakAreas.push('CGPA improvement strategies');
    if ((profile.programming_skill || 0) < 7) weakAreas.push('Data Structures & Algorithms');
    if ((profile.communication_skill || 0) < 7) weakAreas.push('Communication & soft skills');
    if ((profile.projects || 0) < 2) weakAreas.push('Building real-world projects');
    if ((profile.certifications || 0) < 2) weakAreas.push('Industry certifications');
    if ((profile.internships || 0) === 0) weakAreas.push('Getting internship experience');
    if ((profile.problem_solving || 0) < 7) weakAreas.push('Problem solving & aptitude');
    if (weakAreas.length === 0) weakAreas.push('Interview preparation', 'Advanced DSA', 'System Design basics');

    const prompt = `Create a focused 30-day placement preparation roadmap for a student with these weak areas: ${weakAreas.join(', ')}.

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "title": "Your 30-Day Placement Roadmap",
  "focus_areas": ["area1", "area2", "area3"],
  "weeks": [
    {
      "week": 1,
      "theme": "Week theme name",
      "goal": "What will be achieved this week",
      "days": [
        {
          "day": 1,
          "title": "Day title",
          "tasks": ["specific task 1", "specific task 2", "specific task 3"],
          "resource": "One specific link or resource name",
          "time": "2 hours"
        }
      ]
    }
  ]
}
Create all 4 weeks with 7 days each (days 1-7, 8-14, 15-21, 22-28 plus days 29-30 in week 4). Make tasks very specific and actionable.`;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || '';
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      setRoadmap(parsed);
      localStorage.setItem('roadmap_data', JSON.stringify(parsed));
    } catch (e) {
      // Fallback roadmap
      const fallback = {
        title: "Your 30-Day Placement Roadmap",
        focus_areas: weakAreas.slice(0, 3),
        weeks: [
          { week: 1, theme: "Foundation & Assessment", goal: "Identify all gaps and start basics",
            days: [
              { day: 1, title: "Assess & Plan", tasks: ["Take a mock aptitude test online", "List 10 target companies", "Set up LeetCode account"], resource: "LeetCode.com", time: "2 hours" },
              { day: 2, title: "DSA Basics", tasks: ["Revise Arrays fundamentals", "Solve 3 easy array problems on LeetCode", "Watch Array tutorial on YouTube"], resource: "GeeksForGeeks Arrays", time: "3 hours" },
              { day: 3, title: "String Problems", tasks: ["Solve 3 string problems", "Practice anagram & palindrome", "Review string methods in Python/Java"], resource: "LeetCode Strings", time: "2 hours" },
              { day: 4, title: "Resume Update", tasks: ["Update resume with all projects", "Add skills section", "Get resume reviewed on Reddit r/cscareerquestions"], resource: "Resume.io", time: "2 hours" },
              { day: 5, title: "Aptitude Practice", tasks: ["Solve 20 speed & distance questions", "Solve 20 percentage questions", "Take a timed 30-question test"], resource: "IndiaBix.com", time: "2 hours" },
              { day: 6, title: "Communication", tasks: ["Record yourself answering 'Tell me about yourself'", "Write one formal email", "Watch body language tips video"], resource: "YouTube: Mock Interview tips", time: "1.5 hours" },
              { day: 7, title: "Week 1 Review", tasks: ["Revise all topics covered", "Solve 5 mixed problems", "Plan week 2 goals"], resource: "Your notes", time: "2 hours" },
            ]
          },
          { week: 2, theme: "Skill Building", goal: "Build core technical and aptitude skills",
            days: [
              { day: 8, title: "Linked Lists", tasks: ["Learn linked list theory", "Implement singly linked list", "Solve 3 linked list problems"], resource: "GeeksForGeeks Linked List", time: "3 hours" },
              { day: 9, title: "Stacks & Queues", tasks: ["Implement stack and queue", "Solve valid parentheses problem", "Solve next greater element"], resource: "LeetCode Stack", time: "2.5 hours" },
              { day: 10, title: "Work & Time Problems", tasks: ["Study all work-time formulas", "Solve 25 practice problems", "Note all shortcuts and tricks"], resource: "IndiaBix Work & Time", time: "2 hours" },
              { day: 11, title: "Project Work", tasks: ["Start a mini project (CRUD app / weather app)", "Push code to GitHub", "Write a README for the project"], resource: "GitHub.com", time: "4 hours" },
              { day: 12, title: "HR Interview Prep", tasks: ["Prepare answers to top 10 HR questions", "Practice STAR method for behavioral questions", "Research company types you want to target"], resource: "Glassdoor interview questions", time: "2 hours" },
              { day: 13, title: "Searching & Sorting", tasks: ["Implement binary search", "Implement bubble and merge sort", "Solve 3 sorting problems"], resource: "GeeksForGeeks Sorting", time: "3 hours" },
              { day: 14, title: "Week 2 Review", tasks: ["Take a full mock test", "Review weak areas", "Update LinkedIn profile"], resource: "LinkedIn.com", time: "2 hours" },
            ]
          },
          { week: 3, theme: "Interview Practice", goal: "Do mock interviews and timed practice",
            days: [
              { day: 15, title: "Mock Interview 1", tasks: ["Do 1 full mock interview using this app", "Record and review your answers", "Note areas for improvement"], resource: "PlaceAI Mock Interview", time: "1 hour" },
              { day: 16, title: "Trees & Graphs", tasks: ["Learn binary tree basics", "Solve tree traversal problems", "Understand BFS and DFS"], resource: "GeeksForGeeks Trees", time: "3 hours" },
              { day: 17, title: "Profit & Loss + Interest", tasks: ["Revise profit-loss formulas", "Solve 30 mixed aptitude questions", "Focus on CI/SI problems"], resource: "IndiaBix", time: "2 hours" },
              { day: 18, title: "Complete Project", tasks: ["Finish and deploy your mini project", "Write a case study for your resume", "Add it to your portfolio"], resource: "Vercel / Netlify for deployment", time: "3 hours" },
              { day: 19, title: "Dynamic Programming", tasks: ["Learn DP basics with memoization", "Solve fibonacci and climbing stairs", "Solve coin change problem"], resource: "Neetcode.io DP playlist", time: "3 hours" },
              { day: 20, title: "Mock Interview 2", tasks: ["Do a technical mock interview", "Practice coding on whiteboard", "Focus on explaining thought process"], resource: "PlaceAI Mock Interview", time: "1.5 hours" },
              { day: 21, title: "Week 3 Review", tasks: ["Solve 10 mixed DSA problems", "Review all aptitude formulas", "Update resume with new project"], resource: "LeetCode random problems", time: "2 hours" },
            ]
          },
          { week: 4, theme: "Final Prep & Apply", goal: "Polish everything and start applying",
            days: [
              { day: 22, title: "System Design Basics", tasks: ["Learn what system design interviews are", "Study load balancer concept", "Read about databases and caching"], resource: "System Design Primer (GitHub)", time: "2 hours" },
              { day: 23, title: "Company Research", tasks: ["Research top 5 target companies", "Note their tech stack and culture", "Prepare company-specific questions"], resource: "Glassdoor + LinkedIn", time: "2 hours" },
              { day: 24, title: "Full Mock Test", tasks: ["Take a full 3-hour mock placement test", "Include aptitude + coding + communication", "Note your scores carefully"], resource: "PlaceAI All Tests", time: "3 hours" },
              { day: 25, title: "Weak Area Sprint", tasks: ["Focus 3 hours on your single weakest area", "Solve 15 problems in that area", "Re-take that section of mock test"], resource: "Based on Day 24 results", time: "3 hours" },
              { day: 26, title: "Interview Etiquette", tasks: ["Practice firm handshake and eye contact", "Plan your interview outfit", "Research common company interview processes"], resource: "YouTube: Interview tips", time: "1 hour" },
              { day: 27, title: "Certification", tasks: ["Complete one online certification (HackerRank, Coursera)", "Add to resume and LinkedIn", "Share on LinkedIn for visibility"], resource: "HackerRank Certifications", time: "3 hours" },
              { day: 28, title: "Final Review", tasks: ["Review all DSA concepts quickly", "Revise top 50 aptitude formulas", "Read all your HR answer notes"], resource: "Your notes", time: "3 hours" },
              { day: 29, title: "Apply & Network", tasks: ["Apply to 10 companies on LinkedIn", "Connect with 5 alumni at target companies", "Send your first cold outreach message"], resource: "LinkedIn.com", time: "2 hours" },
              { day: 30, title: "Day 30 Reflection", tasks: ["Measure progress vs Day 1", "Set Month 2 goals", "Celebrate your hard work! 🎉"], resource: "PlaceAI Dashboard", time: "1 hour" },
            ]
          }
        ]
      };
      setRoadmap(fallback);
      localStorage.setItem('roadmap_data', JSON.stringify(fallback));
    }
    setLoading(false);
  };

  const getTotalTasks = () => {
    if (!roadmap) return 0;
    return roadmap.weeks.reduce((sum, w) => sum + w.days.reduce((s, d) => s + d.tasks.length, 0), 0);
  };

  const getCompletedTasks = () => Object.values(progress).filter(Boolean).length;

  if (profileLoading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:300 }}>
      <div style={{ width:40, height:40, border:'3px solid var(--border)', borderTop:'3px solid var(--accent)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
    </div>
  );

  if (!profile) return (
    <div className="content-area" style={{ maxWidth:500, margin:'0 auto', textAlign:'center', paddingTop:60 }}>
      <div style={{ fontSize:64, marginBottom:16 }}>🗺️</div>
      <h2 style={{ fontFamily:'Space Grotesk', marginBottom:12 }}>Complete Your Profile First</h2>
      <p style={{ color:'var(--text2)', marginBottom:24 }}>We need your profile data to generate a personalized roadmap.</p>
      <a href="/profile" className="btn btn-primary">Go to Profile →</a>
    </div>
  );

  if (!roadmap) return (
    <div className="content-area fade-in" style={{ maxWidth:600, margin:'0 auto' }}>
      <h1 className="section-title">🎯 30-Day Study Roadmap</h1>
      <p className="section-sub">AI generates a personalized day-by-day plan based on your weak areas</p>
      <div className="card" style={{ textAlign:'center', padding:44 }}>
        <div style={{ fontSize:64, marginBottom:16 }}>🗺️</div>
        <h2 style={{ fontFamily:'Space Grotesk', marginBottom:12 }}>Your Personal Roadmap</h2>
        <p style={{ color:'var(--text2)', marginBottom:20, lineHeight:1.7 }}>
          AI will analyze your profile and generate a <strong>30-day personalized study plan</strong> with specific daily tasks, resources, and time estimates — all tailored to your weak areas.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:28 }}>
          {[['📅','30 Days','Day-by-day plan'],['🎯','Personalized','Based on your gaps'],['✅','Trackable','Mark tasks done']].map(([icon, title, desc]) => (
            <div key={title} style={{ background:'var(--bg2)', borderRadius:10, padding:14 }}>
              <div style={{ fontSize:24, marginBottom:6 }}>{icon}</div>
              <div style={{ fontWeight:700, fontSize:13 }}>{title}</div>
              <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{desc}</div>
            </div>
          ))}
        </div>
        <button className="btn btn-primary" style={{ width:'100%', padding:14, fontSize:16 }}
          onClick={generateRoadmap} disabled={loading}>
          {loading ? '⏳ Generating your roadmap...' : '🚀 Generate My 30-Day Roadmap'}
        </button>
        {loading && <p style={{ color:'var(--text3)', fontSize:12, marginTop:12 }}>This takes about 15-20 seconds...</p>}
      </div>
    </div>
  );

  const completedPct = Math.round((getCompletedTasks() / getTotalTasks()) * 100);
  const activeWeekData = roadmap.weeks.find(w => w.week === activeWeek);

  return (
    <div className="content-area fade-in">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 className="section-title">🎯 30-Day Roadmap</h1>
          <p className="section-sub">{roadmap.title}</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 18px', textAlign:'center' }}>
            <div style={{ fontSize:22, fontWeight:800, color:'var(--accent)' }}>{completedPct}%</div>
            <div style={{ fontSize:11, color:'var(--text3)' }}>Complete</div>
          </div>
          <button className="btn btn-secondary" onClick={() => { localStorage.removeItem('roadmap_data'); setRoadmap(null); }}>🔄 Regenerate</button>
        </div>
      </div>

      {/* Overall progress */}
      <div className="card" style={{ marginBottom:20, padding:'16px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'var(--text2)', marginBottom:8 }}>
          <span>Overall Progress: {getCompletedTasks()} / {getTotalTasks()} tasks</span>
          <span style={{ fontWeight:700, color:'var(--accent)' }}>{completedPct}%</span>
        </div>
        <div style={{ height:10, background:'var(--bg2)', borderRadius:10 }}>
          <div style={{ height:'100%', borderRadius:10, background:'linear-gradient(90deg,var(--accent),#8b5cf6)', width:`${completedPct}%`, transition:'width 0.5s' }} />
        </div>
        <div style={{ display:'flex', gap:12, marginTop:12, flexWrap:'wrap' }}>
          {roadmap.focus_areas?.map(area => (
            <span key={area} style={{ fontSize:11, background:'rgba(99,102,241,0.15)', color:'#a5b4fc', padding:'3px 10px', borderRadius:20, fontWeight:600 }}>🎯 {area}</span>
          ))}
        </div>
      </div>

      {/* Week selector */}
      <div style={{ display:'flex', gap:10, marginBottom:20 }}>
        {roadmap.weeks.map(w => {
          const weekTasks = w.days.reduce((s, d) => s + d.tasks.length, 0);
          const weekDone = w.days.reduce((s, d) => s + d.tasks.filter((_, ti) => progress[`week${w.week}_day${d.day}_${ti}`]).length, 0);
          return (
            <button key={w.week} onClick={() => setActiveWeek(w.week)}
              style={{ flex:1, padding:'12px 8px', borderRadius:10, cursor:'pointer', border:`1px solid ${activeWeek===w.week?'var(--accent)':'var(--border)'}`, background:activeWeek===w.week?'rgba(99,102,241,0.15)':'var(--card)', fontFamily:'Outfit,sans-serif', textAlign:'center' }}>
              <div style={{ fontWeight:700, fontSize:13, color:activeWeek===w.week?'var(--accent)':'var(--text)' }}>Week {w.week}</div>
              <div style={{ fontSize:10, color:'var(--text3)', marginTop:2 }}>{w.theme}</div>
              <div style={{ fontSize:10, color:'#10b981', marginTop:4 }}>{weekDone}/{weekTasks} done</div>
            </button>
          );
        })}
      </div>

      {/* Week goal */}
      {activeWeekData && (
        <div style={{ background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:12, padding:'14px 18px', marginBottom:20 }}>
          <span style={{ fontWeight:700, color:'#a5b4fc' }}>🎯 Week {activeWeek} Goal: </span>
          <span style={{ color:'var(--text2)', fontSize:14 }}>{activeWeekData.goal}</span>
        </div>
      )}

      {/* Days */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:14 }}>
        {activeWeekData?.days.map(day => {
          const dayDone = day.tasks.filter((_, ti) => progress[`week${activeWeek}_day${day.day}_${ti}`]).length;
          const allDone = dayDone === day.tasks.length;
          return (
            <div key={day.day} className="card" style={{ borderLeft:`3px solid ${allDone?'#10b981':'var(--border)'}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:11, color:'var(--text3)', fontWeight:600 }}>DAY {day.day}</div>
                  <div style={{ fontWeight:700, fontSize:15 }}>{day.title}</div>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <span style={{ fontSize:11, color:'var(--text3)' }}>⏱️ {day.time}</span>
                  {allDone && <span style={{ fontSize:16 }}>✅</span>}
                </div>
              </div>
              <div style={{ marginBottom:12 }}>
                {day.tasks.map((task, ti) => {
                  const key = `week${activeWeek}_day${day.day}_${ti}`;
                  const done = progress[key];
                  return (
                    <div key={ti} onClick={() => toggleTask(`week${activeWeek}_day${day.day}`, ti)}
                      style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'6px 0', cursor:'pointer', borderBottom:ti < day.tasks.length-1 ? '1px solid var(--bg2)' : 'none' }}>
                      <div style={{ width:18, height:18, borderRadius:4, border:`2px solid ${done?'#10b981':'var(--border)'}`, background:done?'#10b981':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1, transition:'all 0.2s' }}>
                        {done && <span style={{ color:'white', fontSize:11, fontWeight:700 }}>✓</span>}
                      </div>
                      <span style={{ fontSize:13, color:done?'var(--text3)':'var(--text)', textDecoration:done?'line-through':'none', lineHeight:1.4 }}>{task}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize:11, color:'var(--text3)', background:'var(--bg2)', padding:'6px 10px', borderRadius:8 }}>
                📚 {day.resource}
              </div>
              <div style={{ marginTop:8, fontSize:11, color:'var(--text3)' }}>{dayDone}/{day.tasks.length} tasks done</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
