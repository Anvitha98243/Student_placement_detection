import React, { useState, useEffect, useMemo } from 'react';
import roadmapData from '../data/roadmapData';

export default function Roadmap() {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [completedTasks, setCompletedTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('completed_roadmap_tasks') || '{}'); } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem('completed_roadmap_tasks', JSON.stringify(completedTasks));
  }, [completedTasks]);

  const toggleTask = (day, taskIndex) => {
    const taskId = `day-${day}-task-${taskIndex}`;
    setCompletedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const currentWeekData = useMemo(() => roadmapData.find(w => w.id === selectedWeek), [selectedWeek]);

  const overallProgress = useMemo(() => {
    let total = 0, completed = 0;
    roadmapData.forEach(w => w.days.forEach(d => {
      total += d.tasks.length;
      d.tasks.forEach((_, i) => { if (completedTasks[`day-${d.day}-task-${i}`]) completed++; });
    }));
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  }, [completedTasks]);

  const weekColors = [
    'linear-gradient(135deg,#b8f0c8,#c4d4ff)',
    'linear-gradient(135deg,#c4d4ff,#e0c8ff)',
    'linear-gradient(135deg,#e0c8ff,#ffd6e0)',
    'linear-gradient(135deg,#ffd6e0,#b8f0c8)',
  ];

  return (
    <>
      <div className="page-header-aurora">
        <div className="aurora-blob-1 aurora-blob" />
        <div className="aurora-blob-2 aurora-blob" />
        <div className="aurora-blob-3 aurora-blob" />
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="page-title">📆 30-Day Placement Roadmap</h1>
            <p className="page-subtitle">A structured path to land your dream job</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 34, fontWeight: 800, color: 'var(--nav-bg)' }}>{overallProgress}%</div>
            <div style={{ fontSize: 11, color: 'rgba(13,13,26,0.5)', fontWeight: 700, textTransform: 'uppercase' }}>Overall Progress</div>
          </div>
        </div>
      </div>

      <div className="content-area fade-in">
        {/* Progress bar */}
        <div className="card" style={{ marginBottom: 28, padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--nav-bg)' }}>Training Journey</span>
            <span style={{ color: 'var(--text2)', fontSize: 14 }}>{overallProgress}% complete</span>
          </div>
          <div style={{ height: 10, background: 'rgba(108,99,255,0.1)', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{
              width: `${overallProgress}%`, height: '100%',
              background: 'linear-gradient(90deg, #6c63ff, #8b5cf6)',
              transition: 'width 0.6s ease'
            }} />
          </div>
        </div>

        {/* Week selector */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
          {roadmapData.map((w, i) => (
            <button key={w.id} onClick={() => setSelectedWeek(w.id)}
              style={{
                padding: '18px 16px', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                background: selectedWeek === w.id ? weekColors[i] : 'rgba(255,255,255,0.6)',
                border: selectedWeek === w.id ? '2px solid rgba(255,255,255,0.9)' : '1.5px solid rgba(108,99,255,0.15)',
                backdropFilter: 'blur(8px)', transition: 'all 0.25s',
                boxShadow: selectedWeek === w.id ? '0 8px 28px rgba(80,60,180,0.18)' : 'var(--glass-shadow)',
                transform: selectedWeek === w.id ? 'translateY(-2px)' : 'none',
              }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px',
                color: selectedWeek === w.id ? 'rgba(13,13,26,0.6)' : 'var(--text3)', marginBottom: 4 }}>
                WEEK {w.id}
              </div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--nav-bg)', marginBottom: 10 }}>
                {w.title.split(':')[1]?.trim()}
              </div>
            </button>
          ))}
        </div>

        {currentWeekData && (
          <div className="fade-in">
            <div style={{
              padding: '14px 20px', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)',
              borderRadius: 12, borderLeft: '4px solid var(--accent)',
              border: '1px solid rgba(255,255,255,0.8)', borderLeftWidth: 4,
              marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14
            }}>
              <span style={{ fontSize: 20 }}>🎯</span>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Week {selectedWeek} Goal</div>
                <div style={{ color: 'var(--text2)', fontSize: 14 }}>{currentWeekData.goal}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))', gap: 20 }}>
              {currentWeekData.days.map((dayData) => (
                <div key={dayData.day} className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 2 }}>DAY {dayData.day}</div>
                      <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--nav-bg)' }}>{dayData.title}</h3>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text3)', background: 'rgba(108,99,255,0.08)', padding: '4px 10px', borderRadius: 999 }}>⏱️ {dayData.time}</span>
                  </div>

                  <div style={{ flex: 1 }}>
                    {dayData.tasks.map((task, idx) => {
                      const taskId = `day-${dayData.day}-task-${idx}`;
                      return (
                        <div key={idx} style={{
                          display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10,
                          padding: '8px 10px', borderRadius: 8,
                          background: completedTasks[taskId] ? 'rgba(5,150,105,0.06)' : 'rgba(108,99,255,0.03)',
                          border: completedTasks[taskId] ? '1px solid rgba(5,150,105,0.15)' : '1px solid rgba(108,99,255,0.08)',
                          transition: 'all 0.2s'
                        }}>
                          <input type="checkbox" checked={!!completedTasks[taskId]}
                            onChange={() => toggleTask(dayData.day, idx)}
                            style={{ marginTop: 2, cursor: 'pointer', accentColor: '#6c63ff' }} />
                          <span style={{
                            fontSize: 13, color: completedTasks[taskId] ? 'var(--text3)' : 'var(--text2)',
                            textDecoration: completedTasks[taskId] ? 'line-through' : 'none',
                            lineHeight: 1.5
                          }}>{task}</span>
                        </div>
                      );
                    })}
                  </div>

                  {dayData.links.length > 0 && (
                    <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(108,99,255,0.1)' }}>
                      <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Resources</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {dayData.links.map((link, lidx) => (
                          <a key={lidx} href={link.url} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none',
                              background: 'rgba(108,99,255,0.07)', padding: '4px 10px', borderRadius: 999,
                              border: '1px solid rgba(108,99,255,0.15)' }}>
                            🔗 {link.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text3)', textAlign: 'right' }}>
                    {dayData.tasks.filter((_,i) => completedTasks[`day-${dayData.day}-task-${i}`]).length}/{dayData.tasks.length} tasks done
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}