styles = """
/* Aptitude Dashboard Styles */
.aptitude-container {
  display: grid;
  grid-template-columns: 280px 1fr 300px;
  gap: 20px;
  height: calc(100vh - 100px);
  overflow: hidden;
}

.aptitude-sidebar {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow-y: auto;
  padding: 16px;
}

.aptitude-main {
  overflow-y: auto;
  padding-right: 12px;
}

.aptitude-right {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.topic-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  margin-bottom: 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text2);
  border: 1px solid transparent;
}

.topic-item:hover {
  background: var(--card2);
  color: var(--text);
}

.topic-item.active {
  background: rgba(99, 102, 241, 0.1);
  border-color: var(--accent);
  color: #fff;
}

.palette-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.palette-box {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text3);
}

.palette-box:hover {
  border-color: var(--accent);
}

.palette-box.answered {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
}

.palette-box.current {
  border: 2px solid #fff;
  color: #fff;
}

.explanation-card {
  margin-top: 16px;
  padding: 16px;
  background: rgba(16, 185, 129, 0.05);
  border-left: 4px solid var(--success);
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
}

.explanation-card.wrong {
  background: rgba(239, 68, 68, 0.05);
  border-left-color: var(--danger);
}

@media (max-width: 1200px) {
  .aptitude-container {
    grid-template-columns: 240px 1fr;
  }
  .aptitude-right {
    display: none;
  }
}

@media (max-width: 900px) {
  .aptitude-container {
    grid-template-columns: 1fr;
    height: auto;
  }
  .aptitude-sidebar {
    display: none;
  }
}
"""

with open(r'c:\Users\vasan\Downloads\Student_placement_detection-main\Student_placement_detection-main\frontend\src\index.css', 'a', encoding='utf-8') as f:
    f.write('\n' + styles)
