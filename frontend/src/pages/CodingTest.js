import React, { useState, useMemo, useEffect } from 'react';
import problemsData from '../data/problems';

const ROLES = [
  'Software Developer', 'Frontend Developer', 'Backend Developer', 
  'Full Stack Developer', 'DevOps Engineer', 'System Engineer',
  'Data Scientist', 'Mobile Developer', 'QA Engineer', 'Security Engineer'
];

const CATEGORY_ICONS = {
  // DSA
  'Arrays & Hashing': '🔢',
  'Two Pointers': '👉👈',
  'Sliding Window': '🪟',
  'Stack': '📚',
  'Binary Search': '🔍',
  'Linked List': '🔗',
  'Trees': '🌲',
  'Tries': '🎋',
  'Backtracking': '↩️',
  'Graphs': '🕸️',
  'Advanced Graphs': '🛸',
  'Dynamic Programming': '📉',
  'Greedy': '🤑',
  'Intervals': '⏰',
  'Math & Geometry': '📐',
  'Bit Manipulation': '💾',
  // Ops
  'Linux & Shell': '🐚',
  'Networking': '🌐',
  'Docker & K8s': '🐳',
  'CI/CD': '🚀',
  'Security & IAM': '🛡️',
  'Monitoring & Logging': '📊',
  'System Architecture': '🏛️',
  'Machine Learning': '🤖'
};

export default function CodingTest() {
  const [selectedRole, setSelectedRole] = useState('Software Developer');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [completedProblems, setCompletedProblems] = useState(() => {
    const saved = localStorage.getItem('completed_problems_massive');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('completed_problems_massive', JSON.stringify(completedProblems));
  }, [completedProblems]);

  const toggleStatus = (id) => {
    setCompletedProblems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Reset category when role changes
  useEffect(() => {
    setSelectedCategory('All');
  }, [selectedRole]);

  const filteredProblems = useMemo(() => {
    return problemsData.filter(p => {
      const matchesRole = p.role === selectedRole;
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRole && matchesCategory && matchesSearch;
    });
  }, [selectedRole, selectedCategory, searchQuery]);

  const categories = useMemo(() => {
    const cats = new Set();
    problemsData.forEach(p => {
      if (p.role === selectedRole) cats.add(p.category);
    });
    return ['All', ...Array.from(cats)];
  }, [selectedRole]);

  const groupedProblems = useMemo(() => {
    const groups = {};
    filteredProblems.forEach(p => {
      if (!groups[p.category]) groups[p.category] = [];
      groups[p.category].push(p);
    });
    return groups;
  }, [filteredProblems]);

  const totalInRole = useMemo(() => {
    return problemsData.filter(p => p.role === selectedRole).length;
  }, [selectedRole]);

  const solvedInRole = useMemo(() => {
    return problemsData.filter(p => p.role === selectedRole && completedProblems[p.id]).length;
  }, [selectedRole, completedProblems]);

  return (
    <div className="content-area fade-in">
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <h1 className="section-title">🚀 Interview Preparation</h1>
          <p className="section-sub">Mastering technical challenges across {ROLES.length} specialized roles</p>
        </div>
        
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search all problems..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '12px 16px',
              color: 'var(--text)',
              width: '280px',
              outline: 'none',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 400px) 1fr', gap: 32, marginBottom: 32 }}>
        <div className="role-selector-container">
          <label style={{ display: 'block', marginBottom: 8, fontSize: '13px', color: 'var(--text2)', fontWeight: 600 }}>Select Your Target Role</label>
          <select 
            className="role-dropdown"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            {ROLES.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '16px 24px', background: 'var(--bg2)', borderRadius: 16, border: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Progress</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)' }}>
              {solvedInRole} <span style={{ color: 'var(--text3)', fontSize: '16px', fontWeight: 500 }}>/ {totalInRole}</span>
            </div>
          </div>
          <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${(solvedInRole / totalInRole) * 100}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, var(--accent) 0%, #a855f7 100%)',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>
      </div>

      <div className="pill-container">
        {categories.map(cat => (
          <div 
            key={cat} 
            className={`pill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat !== 'All' && <span className="pill-icon">{CATEGORY_ICONS[cat] || '✨'}</span>}
            {cat}
          </div>
        ))}
      </div>

      <div className="problem-table-container">
        <table className="problem-table">
          <thead>
            <tr>
              <th style={{ width: '80px', textAlign: 'center' }}>Status</th>
              <th>Problem Title</th>
              <th style={{ width: '140px' }}>Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(groupedProblems).length > 0 ? (
              Object.entries(groupedProblems).map(([category, items]) => (
                <React.Fragment key={category}>
                  <tr>
                    <td colSpan="3" className="category-header">
                      <span style={{ fontSize: '18px', marginRight: '8px' }}>{CATEGORY_ICONS[category] || '📁'}</span>
                      {category} <span style={{ color: 'var(--text3)', fontSize: '12px', marginLeft: '12px', fontWeight: 500 }}>{items.length} Questions</span>
                    </td>
                  </tr>
                  {items.map(prob => (
                    <tr key={prob.id} className="problem-row">
                      <td style={{ textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          className="status-checkbox"
                          checked={!!completedProblems[prob.id]}
                          onChange={() => toggleStatus(prob.id)}
                        />
                      </td>
                      <td>
                        <a 
                          href={prob.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="problem-link"
                          title={`Solve on ${prob.platform}`}
                        >
                          {prob.title}
                          <span style={{ fontSize: '10px', color: 'var(--text3)', marginLeft: '10px', fontWeight: 500 }}>({prob.platform})</span>
                        </a>
                      </td>
                      <td>
                        <span className={`diff-${prob.difficulty.toLowerCase()}`} style={{ fontWeight: 700 }}>
                          {prob.difficulty}
                        </span>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text3)' }}>
                  <div style={{ fontSize: 64, marginBottom: 24 }}>🏖️</div>
                  <h3 style={{ color: 'var(--text)' }}>No Matching Challenges</h3>
                  <p>Try adjusting your search or category filters</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 48, padding: 32, background: 'var(--card)', borderRadius: 24, border: '1px solid var(--border)', textAlign: 'center' }}>
        <h3 style={{ marginBottom: 16 }}>🎯 Your Daily Goal</h3>
        <p style={{ color: 'var(--text2)', maxWidth: '600px', margin: '0 auto 24px', lineHeight: 1.6 }}>
          Solving just 1-2 problems daily in the <strong>{selectedRole}</strong> track can significantly increase your placement chances!
        </p>
        <button className="btn btn-secondary" onClick={() => setCompletedProblems({})}>
          Reset Progress Tracking
        </button>
      </div>
    </div>
  );
}
