# 🎯 PlaceAI — AI Student Placement Prediction System

A full-stack web application that predicts student placement chances using Machine Learning, with dynamic tests, resume scoring, and personalized improvement suggestions.

---

## 🌟 Features

| Feature | Details |
|---|---|
| 🔐 Auth | JWT-based Login / Register |
| 🤖 ML Prediction | Gradient Boosting model — **86.5% accuracy** |
| 📊 Dashboard | Skill radar, placement probability, test scores |
| 👤 Profile | CGPA, skills, projects, certifications, internships |
| 💻 Coding Test | 5 real coding problems with code editor |
| 🧠 Aptitude Test | 10 MCQs with timer (10 min) |
| 🗣️ Communication | Email writing + situational scenarios |
| 📄 Resume Score | AI-calculated score from profile data |
| ⚡ Suggestions | Personalized priority actions |
| 📚 Resources | Curated links for coding, certs, resume |
| 📈 Results | Score history with progress charts |

---

## 🛠️ Tech Stack

**Backend**
- Python + Flask
- SQLAlchemy + SQLite
- Flask-JWT-Extended (auth)
- Scikit-learn (Gradient Boosting, 86.5% acc)
- 5000-sample synthetic dataset

**Frontend**
- React 18
- React Router v6
- Recharts (charts)
- Axios (API calls)
- Custom CSS design system (dark theme)

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm

### Option 1: Windows
```
Double-click: start_windows.bat
```

### Option 2: Mac / Linux
```bash
chmod +x start_mac_linux.sh
./start_mac_linux.sh
```

### Option 3: Manual Steps

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python train_model.py       # Trains ML model (run once)
python app.py               # Starts Flask on port 5000
```

**Frontend:**
```bash
cd frontend
npm install
npm start                   # Opens http://localhost:3000
```

---

## 📁 Project Structure

```
ai-placement-system/
├── backend/
│   ├── app.py               # Flask API (all routes)
│   ├── train_model.py       # ML training script
│   ├── requirements.txt     # Python dependencies
│   ├── models/              # Saved ML model (after training)
│   │   ├── placement_model.pkl
│   │   ├── branch_encoder.pkl
│   │   └── model_metadata.json
│   └── data/
│       └── placement_dataset.csv
│
├── frontend/
│   ├── public/index.html
│   ├── package.json
│   └── src/
│       ├── App.js           # Routing
│       ├── index.css        # Design system
│       ├── utils/
│       │   ├── api.js       # Axios instance
│       │   └── AuthContext.js
│       ├── components/
│       │   └── Layout.js    # Sidebar + navigation
│       └── pages/
│           ├── Login.js
│           ├── Register.js
│           ├── Dashboard.js
│           ├── Profile.js
│           ├── CodingTest.js
│           ├── AptitudeTest.js
│           ├── CommunicationTest.js
│           ├── Resources.js
│           └── Results.js
│
├── start_windows.bat
├── start_mac_linux.sh
└── README.md
```

---

## 🤖 ML Model Details

| Property | Value |
|---|---|
| Algorithm | Gradient Boosting Classifier |
| Training Samples | 4,000 |
| Test Samples | 1,000 |
| Accuracy | **86.5%** |
| Features | 18 (CGPA, skills, extras, branch, etc.) |
| Dataset | 5,000 synthetic records (realistic distribution) |

**Input Features:**
- Academic: CGPA, 10th %, 12th %, backlogs, branch
- Skills: Programming, Communication, Problem Solving, Teamwork, Leadership
- Extras: Internships, Projects, Certifications, Hackathons
- Scores: Resume score, Aptitude, Coding, Communication tests

---

## 🔑 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | ❌ | Register new user |
| POST | /api/auth/login | ❌ | Login |
| GET | /api/auth/me | ✅ | Get current user |
| POST | /api/profile | ✅ | Save profile + predict |
| GET | /api/profile | ✅ | Get profile + history |
| GET | /api/tests/coding | ✅ | Get coding problems |
| GET | /api/tests/aptitude | ✅ | Get aptitude questions |
| GET | /api/tests/communication | ✅ | Get communication scenarios |
| POST | /api/tests/submit | ✅ | Submit test result |
| GET | /api/resources | ✅ | Get learning resources |
| GET | /api/dashboard/stats | ✅ | Dashboard stats |
| GET | /api/model/info | ❌ | ML model metadata |

---

## 🎨 Screenshots

- **Login/Register** — Split-screen design with feature highlights
- **Dashboard** — Stats, radar chart, bar chart, quick actions
- **Profile** — 3-tab form (Academic → Skills → Extras) + live prediction
- **Coding Test** — Problem list + code editor side by side
- **Aptitude Test** — Timer + MCQs with instant feedback
- **Communication** — Email writing + situational MCQs
- **Resources** — Tabbed resource cards + preparation roadmap
- **Results** — Test history table + line chart progress

---

## 📝 Notes

- The ML model is trained on synthetic but realistic data based on real placement patterns
- JWT tokens expire after 24 hours
- SQLite database is auto-created on first run (`placement.db`)
- The model needs to be trained once (`python train_model.py`) before starting the backend

---

## 🧑‍💻 Built With

- Python + Flask + Scikit-learn (Backend + ML)
- React 18 + Recharts (Frontend)
- SQLite + SQLAlchemy (Database)
- JWT (Authentication)

---

*PlaceAI — Know your chances. Improve your skills. Land your dream job.* 🎯
