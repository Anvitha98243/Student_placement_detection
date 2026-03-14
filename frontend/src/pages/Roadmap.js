import React, { useState, useEffect, useMemo } from 'react';
import roadmapData from '../data/roadmapData';

export default function Roadmap() {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [completedTasks, setCompletedTasks] = useState(() => {
    const saved = localStorage.getItem('completed_roadmap_tasks');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('completed_roadmap_tasks', JSON.stringify(completedTasks));
  }, [completedTasks]);

  const toggleTask = (day, taskIndex) => {
    const taskId = `day-${day}-task-${taskIndex}`;
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const currentWeekData = useMemo(() => {
    return roadmapData.find(w => w.id === selectedWeek);
  }, [selectedWeek]);

  const weekProgress = useMemo(() => {
    if (!currentWeekData) return 0;
    const totalTasks = currentWeekData.days.reduce((acc, d) => acc + d.tasks.length, 0);
    const completedInWeek = currentWeekData.days.reduce((acc, d) => {
      const dayTasks = d.tasks.filter((_, i) => completedTasks[`day-${d.day}-task-${i}`]);
      return acc + dayTasks.length;
    }, 0);
    return totalTasks === 0 ? 0 : Math.round((completedInWeek / totalTasks) * 100);
  }, [currentWeekData, completedTasks]);

  const overallProgress = useMemo(() => {
    let total = 0;
    let completed = 0;
    roadmapData.forEach(w => {
      w.days.forEach(d => {
        total += d.tasks.length;
        d.tasks.forEach((_, i) => {
          if (completedTasks[`day-${d.day}-task-${i}`]) completed++;
        });
      });
    });
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  }, [completedTasks]);

  return (
    <div className="content-area fade-in">
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="section-title">📆 30-Day Placement Roadmap</h1>
          <p className="section-sub">A structured path to land your dream job</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--accent)' }}>{overallProgress}%</div>
          <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: '600', textTransform: 'uppercase' }}>Overall Progress</div>
        </div>
      </div>

      {/* Progress Card */}
      <div className="card" style={{ marginBottom: 32, padding: '24px', background: 'linear-gradient(135deg, var(--bg2) 0%, var(--card) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
          <span style={{ fontWeight: '600' }}>Training Journey</span>
          <span style={{ color: 'var(--text2)', fontSize: '14px' }}>{overallProgress}% complete</span>
        </div>
        <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
          <div 
            style={{ 
              width: `${overallProgress}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
              transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
            }} 
          />
        </div>
      </div>

      {/* Week Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {roadmapData.map(w => (
          <button
            key={w.id}
            onClick={() => setSelectedWeek(w.id)}
            style={{
              padding: '20px',
              borderRadius: '16px',
              border: '2px solid',
              borderColor: selectedWeek === w.id ? 'var(--accent)' : 'var(--border)',
              background: selectedWeek === w.id ? 'rgba(99, 102, 241, 0.1)' : 'var(--card)',
              color: 'var(--text)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'left'
            }}
          >
            <div style={{ fontSize: '13px', color: selectedWeek === w.id ? 'var(--accent)' : 'var(--text3)', fontWeight: '700', marginBottom: 4 }}>WEEK {w.id}</div>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: 8 }}>{w.title.split(':')[1].trim()}</div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${w.id === selectedWeek ? weekProgress : 0}%`, // Simplified for now
                  height: '100%', 
                  background: 'var(--accent)',
                  transition: 'width 0.4s ease'
                }} 
              />
            </div>
          </button>
        ))}
      </div>

      {currentWeekData && (
        <div className="fade-in">
          <div style={{ 
            padding: '16px 24px', 
            background: 'var(--bg2)', 
            borderRadius: '12px', 
            borderLeft: '4px solid var(--accent)',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}>
            <span style={{ fontSize: '20px' }}>🎯</span>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: '700', textTransform: 'uppercase' }}>Week {selectedWeek} Goal</div>
              <div style={{ color: 'var(--text2)', fontSize: '15px' }}>{currentWeekData.goal}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
            {currentWeekData.days.map((dayData) => (
              <div 
                key={dayData.day} 
                className="card" 
                style={{ 
                  padding: '24px', 
                  display: 'flex', 
                  flexDirection: 'column',
                  border: '1px solid var(--border)',
                  position: 'relative'
                }}
              >
                <div style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '12px', color: 'var(--text3)', fontWeight: '600' }}>
                  ⏱️ {dayData.time}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '700', marginBottom: 4 }}>DAY {dayData.day}</div>
                <h3 style={{ marginBottom: 20 }}>{dayData.title}</h3>

                <div style={{ flex: 1 }}>
                  {dayData.tasks.map((task, idx) => {
                    const taskId = `day-${dayData.day}-task-${idx}`;
                    return (
                      <div 
                        key={idx} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          gap: 12, 
                          marginBottom: 12,
                          padding: '8px',
                          borderRadius: '8px',
                          background: completedTasks[taskId] ? 'rgba(34, 197, 94, 0.05)' : 'transparent',
                          transition: 'background 0.2s ease'
                        }}
                      >
                        <input 
                          type="checkbox" 
                          checked={!!completedTasks[taskId]}
                          onChange={() => toggleTask(dayData.day, idx)}
                          style={{ marginTop: '3px', cursor: 'pointer' }}
                        />
                        <span style={{ 
                          fontSize: '14px', 
                          color: completedTasks[taskId] ? 'var(--text3)' : 'var(--text2)',
                          textDecoration: completedTasks[taskId] ? 'line-through' : 'none'
                        }}>
                          {task}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {dayData.links.length > 0 && (
                  <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '700', marginBottom: 8, textTransform: 'uppercase' }}>Resources</div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {dayData.links.map((link, lidx) => (
                        <a 
                          key={lidx} 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ 
                            fontSize: '12px', 
                            color: 'var(--accent)', 
                            textDecoration: 'none',
                            background: 'rgba(99, 102, 241, 0.05)',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: '1px solid rgba(99, 102, 241, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          🔗 {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 16, fontSize: '11px', color: 'var(--text3)', textAlign: 'right' }}>
                  {dayData.tasks.filter((_, i) => completedTasks[`day-${dayData.day}-task-${i}`]).length}/{dayData.tasks.length} tasks done
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
