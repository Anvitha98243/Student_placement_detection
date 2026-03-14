import React, { useState, useMemo, useEffect } from 'react';
import problemsData from '../data/problems';

const ROLES = [
  'Software Developer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'DevOps Engineer', 'System Engineer',
  'Data Scientist', 'Mobile Developer', 'QA Engineer', 'Security Engineer'
];

const CATEGORY_ICONS = {
  'Arrays & Hashing': '🔢', 'Two Pointers': '👉👈', 'Sliding Window': '🪟',
  'Stack': '📚', 'Binary Search': '🔍', 'Linked List': '🔗',
  'Trees': '🌲', 'Tries': '🎋', 'Backtracking': '↩️', 'Graphs': '🕸️',
  'Dynamic Programming': '📉', 'Greedy': '🤑', 'Math & Geometry': '📐',
  'Linux & Shell': '🐚', 'Networking': '🌐', 'Docker & K8s': '🐳',
  'CI/CD': '🚀', 'System Architecture': '🏛️', 'Machine Learning': '🤖',
  'SQL': '🗃️',
};

export default function CodingTest() {
  const [selectedRole, setSelectedRole] = useState('Software Developer');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [completedProblems, setCompletedProblems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('completed_problems_massive') || '{}'); } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem('completed_problems_massive', JSON.stringify(completedProblems));
  }, [completedProblems]);

  useEffect(() => { setSelectedCategory('All'); }, [selectedRole]);

  const toggleStatus = (id) => setCompletedProblems(prev => ({ ...prev, [id]: !prev[id] }));

  const filteredProblems = useMemo(() => problemsData.filter(p =>
    p.role === selectedRole &&
    (selectedCategory === 'All' || p.category === selectedCategory) &&
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  ), [selectedRole, selectedCategory, searchQuery]);

  const categories = useMemo(() => {
    const cats = new Set();
    problemsData.forEach(p => { if (p.role === selectedRole) cats.add(p.category); });
    return ['All', ...Array.from(cats)];
  }, [selectedRole]);

  const groupedProblems = useMemo(() => {
    const groups = {};
    filteredProblems.forEach(p => { if (!groups[p.category]) groups[p.category] = []; groups[p.category].push(p); });
    return groups;
  }, [filteredProblems]);

  const totalInRole = useMemo(() => problemsData.filter(p => p.role === selectedRole).length, [selectedRole]);
  const solvedInRole = useMemo(() => problemsData.filter(p => p.role === selectedRole && completedProblems[p.id]).length, [selectedRole, completedProblems]);

  return (
    <>
      <div className="page-header-aurora">
        <div className="aurora-blob-1 aurora-blob" />
        <div className="aurora-blob-2 aurora-blob" />
        <div className="aurora-blob-3 aurora-blob" />
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="page-title">🚀 Interview Preparation</h1>
            <p className="page-subtitle">Master technical challenges across {ROLES.length} specialised roles</p>
          </div>
          <div className="search-box">
            <input type="text" placeholder="Search problems…" value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(8px)',
                border: '1.5px solid rgba(255,255,255,0.85)', borderRadius: 999,
                padding: '10px 18px', color: 'var(--nav-bg)', width: 260,
                outline: 'none', fontSize: 14
              }} />
          </div>
        </div>
      </div>

      <div className="content-area fade-in">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px,360px) 1fr', gap: 24, marginBottom: 28 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--text2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Target Role
            </label>
            <select className="role-dropdown" value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
              {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
            </select>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 20, padding: '16px 22px',
            background: 'linear-gradient(135deg, rgba(196,212,255,0.5), rgba(224,200,255,0.5))',
            borderRadius: 16, border: '1px solid rgba(255,255,255,0.8)',
            backdropFilter: 'blur(8px)'
          }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Progress</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--nav-bg)' }}>
                {solvedInRole} <span style={{ color: 'var(--text2)', fontSize: 16, fontWeight: 500 }}>/ {totalInRole}</span>
              </div>
            </div>
            <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.5)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                width: `${totalInRole ? (solvedInRole / totalInRole) * 100 : 0}%`, height: '100%',
                background: 'linear-gradient(90deg, #6c63ff, #8b5cf6)',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        </div>

        <div className="pill-container">
          {categories.map(cat => (
            <div key={cat} className={`pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}>
              {cat !== 'All' && <span>{CATEGORY_ICONS[cat] || '✨'}</span>}
              {cat}
            </div>
          ))}
        </div>

        <div className="problem-table-container">
          <table className="problem-table">
            <thead>
              <tr>
                <th style={{ width: 80, textAlign: 'center' }}>Status</th>
                <th>Problem Title</th>
                <th style={{ width: 140 }}>Difficulty</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(groupedProblems).length > 0 ? (
                Object.entries(groupedProblems).map(([category, items]) => (
                  <React.Fragment key={category}>
                    <tr>
                      <td colSpan="3" className="category-header">
                        <span style={{ fontSize: 16, marginRight: 8 }}>{CATEGORY_ICONS[category] || '📁'}</span>
                        {category}
                        <span style={{ color: 'var(--text3)', fontSize: 12, marginLeft: 12, fontWeight: 500 }}>{items.length} Questions</span>
                      </td>
                    </tr>
                    {items.map(prob => (
                      <tr key={prob.id} className="problem-row">
                        <td style={{ textAlign: 'center' }}>
                          <input type="checkbox" className="status-checkbox"
                            checked={!!completedProblems[prob.id]}
                            onChange={() => toggleStatus(prob.id)} />
                        </td>
                        <td>
                          <a href={prob.url} target="_blank" rel="noopener noreferrer" className="problem-link">
                            {prob.title}
                            <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 10, fontWeight: 500 }}>({prob.platform})</span>
                          </a>
                        </td>
                        <td>
                          <span className={`diff-${prob.difficulty.toLowerCase()}`}>{prob.difficulty}</span>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text3)' }}>
                    <div style={{ fontSize: 52, marginBottom: 16 }}>🏖️</div>
                    <h3 style={{ color: 'var(--text2)', marginBottom: 8 }}>No Matching Challenges</h3>
                    <p>Try adjusting your search or category filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{
          marginTop: 40, padding: 32, textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(184,240,200,0.4), rgba(196,212,255,0.4))',
          borderRadius: 20, border: '1px solid rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)'
        }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'var(--nav-bg)', marginBottom: 12 }}>🎯 Your Daily Goal</h3>
          <p style={{ color: 'var(--text2)', maxWidth: 560, margin: '0 auto 24px', lineHeight: 1.6 }}>
            Solving just 1–2 problems daily in the <strong>{selectedRole}</strong> track can significantly increase your placement chances!
          </p>
          <button className="btn btn-secondary" onClick={() => setCompletedProblems({})}>Reset Progress Tracking</button>
        </div>
      </div>
    </>
  );
}