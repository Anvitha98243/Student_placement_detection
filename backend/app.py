"""
AI Student Placement System - Flask Backend
"""
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import joblib, json, os, re
from datetime import timedelta, datetime
import numpy as np

app = Flask(__name__)

# Config
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{BASE_DIR}/placement.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'ai-placement-super-secret-key-2024'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

db = SQLAlchemy(app)
jwt = JWTManager(app)

# CORS manual
@app.after_request
def add_cors(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
    return response

@app.before_request
def handle_options():
    if request.method == 'OPTIONS':
        from flask import make_response
        resp = make_response()
        resp.headers['Access-Control-Allow-Origin'] = '*'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        resp.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
        return resp

# ─── Models ───────────────────────────────────────────────
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    profiles = db.relationship('StudentProfile', backref='user', lazy=True)
    test_results = db.relationship('TestResult', backref='user', lazy=True)

class StudentProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    branch = db.Column(db.String(20))
    cgpa = db.Column(db.Float)
    tenth_percentage = db.Column(db.Float)
    twelfth_percentage = db.Column(db.Float)
    programming_skill = db.Column(db.Float)
    communication_skill = db.Column(db.Float)
    problem_solving = db.Column(db.Float)
    teamwork = db.Column(db.Float)
    leadership = db.Column(db.Float)
    internships = db.Column(db.Integer)
    projects = db.Column(db.Integer)
    certifications = db.Column(db.Integer)
    hackathons = db.Column(db.Integer)
    backlogs = db.Column(db.Integer)
    resume_score = db.Column(db.Float, default=0)
    prediction_score = db.Column(db.Float, default=0)
    placement_probability = db.Column(db.Float, default=0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)

class TestResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    test_type = db.Column(db.String(50))  # coding, aptitude, communication
    score = db.Column(db.Float)
    total = db.Column(db.Float)
    details = db.Column(db.Text)  # JSON
    taken_at = db.Column(db.DateTime, default=datetime.utcnow)

# ─── Load ML Model ────────────────────────────────────────
model = None
encoder = None
metadata = None

def load_model():
    global model, encoder, metadata
    model_path = os.path.join(BASE_DIR, 'models', 'placement_model.pkl')
    enc_path = os.path.join(BASE_DIR, 'models', 'branch_encoder.pkl')
    meta_path = os.path.join(BASE_DIR, 'models', 'model_metadata.json')
    if os.path.exists(model_path):
        model = joblib.load(model_path)
        encoder = joblib.load(enc_path)
        with open(meta_path) as f:
            metadata = json.load(f)
        print(f"Model loaded. Accuracy: {metadata['accuracy']}%")
    else:
        print("WARNING: Model not found. Run train_model.py first.")

# ─── Auth Routes ──────────────────────────────────────────
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    if not data or not all(k in data for k in ['name', 'email', 'password']):
        return jsonify({'error': 'Missing fields'}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409
    user = User(
        name=data['name'],
        email=data['email'],
        password_hash=generate_password_hash(data['password'])
    )
    db.session.add(user)
    db.session.commit()
    token = create_access_token(identity=str(user.id))
    return jsonify({'token': token, 'user': {'id': user.id, 'name': user.name, 'email': user.email}}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data.get('email')).first()
    if not user or not check_password_hash(user.password_hash, data.get('password', '')):
        return jsonify({'error': 'Invalid credentials'}), 401
    token = create_access_token(identity=str(user.id))
    return jsonify({'token': token, 'user': {'id': user.id, 'name': user.name, 'email': user.email}})

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_me():
    uid = int(get_jwt_identity())
    user = User.query.get(uid)
    if not user:
        return jsonify({'error': 'Not found'}), 404
    profile = StudentProfile.query.filter_by(user_id=uid).first()
    return jsonify({
        'user': {'id': user.id, 'name': user.name, 'email': user.email},
        'has_profile': profile is not None
    })

# ─── Profile & Prediction Routes ──────────────────────────
@app.route('/api/profile', methods=['POST'])
@jwt_required()
def save_profile():
    uid = int(get_jwt_identity())
    data = request.json

    # Calculate resume score
    resume_score = calculate_resume_score(data)

    profile = StudentProfile.query.filter_by(user_id=uid).first()
    if not profile:
        profile = StudentProfile(user_id=uid)
        db.session.add(profile)

    for field in ['branch', 'cgpa', 'tenth_percentage', 'twelfth_percentage',
                  'programming_skill', 'communication_skill', 'problem_solving',
                  'teamwork', 'leadership', 'internships', 'projects',
                  'certifications', 'hackathons', 'backlogs']:
        if field in data:
            setattr(profile, field, data[field])

    profile.resume_score = resume_score
    profile.updated_at = datetime.utcnow()

    # ML Prediction
    if model:
        prob, score = predict_placement(profile)
        profile.placement_probability = prob
        profile.prediction_score = score

    db.session.commit()
    return jsonify({
        'message': 'Profile saved',
        'resume_score': resume_score,
        'placement_probability': profile.placement_probability,
        'prediction_score': profile.prediction_score,
        'suggestions': generate_suggestions(profile)
    })

@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    uid = int(get_jwt_identity())
    profile = StudentProfile.query.filter_by(user_id=uid).first()
    if not profile:
        return jsonify({'profile': None})
    
    test_results = TestResult.query.filter_by(user_id=uid).order_by(TestResult.taken_at.desc()).limit(10).all()
    tests = [{'type': t.test_type, 'score': t.score, 'total': t.total, 'date': t.taken_at.isoformat()} for t in test_results]

    return jsonify({
        'profile': {
            'branch': profile.branch,
            'cgpa': profile.cgpa,
            'tenth_percentage': profile.tenth_percentage,
            'twelfth_percentage': profile.twelfth_percentage,
            'programming_skill': profile.programming_skill,
            'communication_skill': profile.communication_skill,
            'problem_solving': profile.problem_solving,
            'teamwork': profile.teamwork,
            'leadership': profile.leadership,
            'internships': profile.internships,
            'projects': profile.projects,
            'certifications': profile.certifications,
            'hackathons': profile.hackathons,
            'backlogs': profile.backlogs,
            'resume_score': profile.resume_score,
            'placement_probability': profile.placement_probability,
            'prediction_score': profile.prediction_score,
            'suggestions': generate_suggestions(profile)
        },
        'test_results': tests
    })

# ─── Tests Routes ─────────────────────────────────────────
@app.route('/api/tests/coding', methods=['GET'])
@jwt_required()
def get_coding_problems():
    problems = [
        {
            'id': 1, 'title': 'Two Sum',
            'difficulty': 'Easy', 'category': 'Array',
            'description': 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
            'examples': [{'input': 'nums = [2,7,11,15], target = 9', 'output': '[0,1]'}],
            'starter_code': 'def two_sum(nums, target):\n    # Write your solution\n    pass',
            'test_cases': [{'input': [2,7,11,15], 'target': 9, 'expected': [0,1]}]
        },
        {
            'id': 2, 'title': 'Palindrome Check',
            'difficulty': 'Easy', 'category': 'String',
            'description': 'Given a string, determine if it is a palindrome, considering only alphanumeric characters.',
            'examples': [{'input': '"A man a plan a canal Panama"', 'output': 'True'}],
            'starter_code': 'def is_palindrome(s):\n    # Write your solution\n    pass',
            'test_cases': []
        },
        {
            'id': 3, 'title': 'FizzBuzz',
            'difficulty': 'Easy', 'category': 'Logic',
            'description': 'Print numbers 1 to n. For multiples of 3 print "Fizz", for multiples of 5 print "Buzz", for multiples of both print "FizzBuzz".',
            'examples': [{'input': 'n = 15', 'output': '1 2 Fizz 4 Buzz ... FizzBuzz'}],
            'starter_code': 'def fizz_buzz(n):\n    # Write your solution\n    pass',
            'test_cases': []
        },
        {
            'id': 4, 'title': 'Reverse Linked List',
            'difficulty': 'Medium', 'category': 'Linked List',
            'description': 'Reverse a singly linked list.',
            'examples': [{'input': '1 -> 2 -> 3 -> 4 -> 5', 'output': '5 -> 4 -> 3 -> 2 -> 1'}],
            'starter_code': 'def reverse_list(head):\n    # Write your solution\n    pass',
            'test_cases': []
        },
        {
            'id': 5, 'title': 'Binary Search',
            'difficulty': 'Medium', 'category': 'Search',
            'description': 'Given a sorted array and a target, return the index using binary search.',
            'examples': [{'input': 'nums = [-1,0,3,5,9,12], target = 9', 'output': '4'}],
            'starter_code': 'def binary_search(nums, target):\n    # Write your solution\n    pass',
            'test_cases': []
        }
    ]
    return jsonify({'problems': problems})

@app.route('/api/tests/aptitude', methods=['GET'])
@jwt_required()
def get_aptitude_questions():
    questions = [
        {'id': 1, 'question': 'If a train travels 60km in 45 minutes, what is its speed in km/h?', 'options': ['70', '80', '90', '75'], 'answer': 1, 'category': 'Speed & Distance'},
        {'id': 2, 'question': 'What is 15% of 240?', 'options': ['36', '38', '34', '32'], 'answer': 0, 'category': 'Percentages'},
        {'id': 3, 'question': 'A can do a work in 10 days and B in 15 days. In how many days can they together complete it?', 'options': ['5', '6', '7', '8'], 'answer': 1, 'category': 'Work & Time'},
        {'id': 4, 'question': 'Find the next number: 2, 6, 12, 20, 30, ?', 'options': ['40', '42', '44', '46'], 'answer': 1, 'category': 'Series'},
        {'id': 5, 'question': 'If FRIEND is coded as HUMJTK, how is CANAL coded?', 'options': ['EDRCO', 'ECSCP', 'ECPCP', 'EDROF'], 'answer': 0, 'category': 'Coding'},
        {'id': 6, 'question': 'A rectangle has a perimeter of 40cm and width of 8cm. What is its area?', 'options': ['84', '96', '104', '112'], 'answer': 1, 'category': 'Geometry'},
        {'id': 7, 'question': 'What is the compound interest on ₹5000 at 10% per annum for 2 years?', 'options': ['₹1000', '₹1050', '₹1100', '₹1150'], 'answer': 1, 'category': 'Interest'},
        {'id': 8, 'question': 'If 5 men can complete a task in 8 days, how long will 4 men take?', 'options': ['8', '9', '10', '12'], 'answer': 2, 'category': 'Work & Time'},
        {'id': 9, 'question': 'Choose the odd one out: Apple, Mango, Banana, Carrot, Grape', 'options': ['Apple', 'Mango', 'Carrot', 'Grape'], 'answer': 2, 'category': 'Odd One Out'},
        {'id': 10, 'question': 'A shopkeeper buys an item for ₹200 and sells at ₹250. What is the profit %?', 'options': ['20%', '25%', '30%', '15%'], 'answer': 1, 'category': 'Profit & Loss'},
    ]
    return jsonify({'questions': questions})

@app.route('/api/tests/communication', methods=['GET'])
@jwt_required()
def get_communication_test():
    scenarios = [
        {'id': 1, 'type': 'email', 'prompt': 'Write a professional email to your manager requesting 2 days of leave for a personal emergency.', 'hints': ['Use formal salutation', 'State reason briefly', 'Mention dates clearly', 'Express willingness to complete pending work']},
        {'id': 2, 'type': 'situation', 'prompt': 'You disagree with your team lead about the approach to a project. How would you handle this situation?', 'options': ['Argue your point strongly in front of everyone', 'Schedule a private meeting, present data to support your view respectfully', 'Stay silent and just do what they say', 'Complain to your manager directly'], 'answer': 1},
        {'id': 3, 'type': 'situation', 'prompt': 'A client is angry about a delayed delivery. What is the best response?', 'options': ['Blame the logistics team', 'Apologize, explain briefly, and provide a new timeline', 'Ignore the complaint', 'Offer a refund immediately without consulting management'], 'answer': 1},
        {'id': 4, 'type': 'fill_blank', 'prompt': 'Complete the sentence: "I am writing to ________ the position of Software Engineer at your esteemed organization."', 'options': ['apply for', 'ask about', 'request', 'demand'], 'answer': 0},
        {'id': 5, 'type': 'situation', 'prompt': 'During a presentation, you forget an important point. What do you do?', 'options': ['Panic and stop speaking', 'Calmly say "I\'ll cover that in a moment" and continue', 'Skip it entirely', 'Apologize repeatedly'], 'answer': 1},
    ]
    return jsonify({'scenarios': scenarios})

@app.route('/api/tests/submit', methods=['POST'])
@jwt_required()
def submit_test():
    uid = int(get_jwt_identity())
    data = request.json
    test_type = data.get('test_type')
    score = data.get('score', 0)
    total = data.get('total', 10)

    result = TestResult(
        user_id=uid,
        test_type=test_type,
        score=score,
        total=total,
        details=json.dumps(data.get('details', {}))
    )
    db.session.add(result)

    # Update profile skill based on test
    profile = StudentProfile.query.filter_by(user_id=uid).first()
    if profile:
        pct = (score / total) * 10
        if test_type == 'coding':
            profile.coding_score = pct
            profile.programming_skill = min(10, (profile.programming_skill or 5) * 0.7 + pct * 0.3)
        elif test_type == 'aptitude':
            profile.aptitude_score = pct
            profile.problem_solving = min(10, (profile.problem_solving or 5) * 0.7 + pct * 0.3)
        elif test_type == 'communication':
            profile.communication_test = pct
            profile.communication_skill = min(10, (profile.communication_skill or 5) * 0.7 + pct * 0.3)
        if model:
            prob, sc = predict_placement(profile)
            profile.placement_probability = prob
            profile.prediction_score = sc
        db.session.commit()

    db.session.commit()
    return jsonify({
        'message': 'Test submitted',
        'score': score,
        'total': total,
        'percentage': round(score/total*100, 1),
        'grade': get_grade(score/total*100)
    })

# ─── Resources Route ──────────────────────────────────────
@app.route('/api/resources', methods=['GET'])
@jwt_required()
def get_resources():
    resources = {
        'coding': [
            {'title': 'LeetCode', 'url': 'https://leetcode.com', 'description': 'Practice DSA problems', 'type': 'platform'},
            {'title': 'HackerRank', 'url': 'https://hackerrank.com', 'description': 'Coding challenges & certifications', 'type': 'platform'},
            {'title': 'GeeksForGeeks', 'url': 'https://geeksforgeeks.org', 'description': 'CS concepts & interview prep', 'type': 'website'},
            {'title': 'Codeforces', 'url': 'https://codeforces.com', 'description': 'Competitive programming', 'type': 'platform'},
        ],
        'communication': [
            {'title': 'Coursera - Business Communication', 'url': 'https://coursera.org', 'description': 'Professional communication skills', 'type': 'course'},
            {'title': 'Toastmasters', 'url': 'https://toastmasters.org', 'description': 'Public speaking practice', 'type': 'community'},
        ],
        'certifications': [
            {'title': 'AWS Cloud Practitioner', 'url': 'https://aws.amazon.com/certification', 'description': 'Entry-level cloud certification', 'type': 'certification'},
            {'title': 'Google Data Analytics', 'url': 'https://grow.google/certificates', 'description': 'Data analytics fundamentals', 'type': 'certification'},
            {'title': 'Meta Front-End Developer', 'url': 'https://coursera.org', 'description': 'Web development certification', 'type': 'certification'},
            {'title': 'Microsoft AZ-900', 'url': 'https://microsoft.com/learn', 'description': 'Azure fundamentals', 'type': 'certification'},
        ],
        'resume': [
            {'title': 'Resume.io', 'url': 'https://resume.io', 'description': 'Professional resume builder', 'type': 'tool'},
            {'title': 'Canva Resume', 'url': 'https://canva.com/resumes', 'description': 'Designed resume templates', 'type': 'tool'},
            {'title': 'LinkedIn Learning', 'url': 'https://linkedin.com/learning', 'description': 'Resume writing courses', 'type': 'course'},
        ]
    }
    return jsonify(resources)

@app.route('/api/dashboard/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    uid = int(get_jwt_identity())
    profile = StudentProfile.query.filter_by(user_id=uid).first()
    test_results = TestResult.query.filter_by(user_id=uid).all()

    if not profile:
        return jsonify({'has_profile': False})

    tests_by_type = {}
    for t in test_results:
        if t.test_type not in tests_by_type:
            tests_by_type[t.test_type] = []
        tests_by_type[t.test_type].append(round(t.score/t.total*100, 1))

    return jsonify({
        'has_profile': True,
        'placement_probability': profile.placement_probability,
        'prediction_score': profile.prediction_score,
        'resume_score': profile.resume_score,
        'skills': {
            'programming': profile.programming_skill,
            'communication': profile.communication_skill,
            'problem_solving': profile.problem_solving,
            'teamwork': profile.teamwork,
            'leadership': profile.leadership,
        },
        'academics': {
            'cgpa': profile.cgpa,
            'tenth': profile.tenth_percentage,
            'twelfth': profile.twelfth_percentage,
        },
        'extras': {
            'internships': profile.internships,
            'projects': profile.projects,
            'certifications': profile.certifications,
            'hackathons': profile.hackathons,
        },
        'test_history': tests_by_type,
        'total_tests_taken': len(test_results),
        'suggestions': generate_suggestions(profile)
    })

@app.route('/api/model/info', methods=['GET'])
def model_info():
    if metadata:
        return jsonify(metadata)
    return jsonify({'error': 'Model not loaded'}), 404

# ─── Helper Functions ─────────────────────────────────────
def predict_placement(profile):
    try:
        branch_enc = encoder.transform([profile.branch])[0] if profile.branch else 0
        features = np.array([[
            profile.cgpa or 0,
            profile.tenth_percentage or 0,
            profile.twelfth_percentage or 0,
            profile.programming_skill or 0,
            profile.communication_skill or 0,
            profile.problem_solving or 0,
            profile.teamwork or 0,
            profile.leadership or 0,
            profile.internships or 0,
            profile.projects or 0,
            profile.certifications or 0,
            profile.hackathons or 0,
            profile.backlogs or 0,
            profile.resume_score or 0,
            50.0,  # aptitude default
            50.0,  # coding default
            50.0,  # communication test default
            branch_enc
        ]])
        prob = model.predict_proba(features)[0][1] * 100
        score = round(prob, 1)
        return round(prob, 1), score
    except Exception as e:
        print(f"Prediction error: {e}")
        return 50.0, 50.0

def calculate_resume_score(data):
    score = 0
    cgpa = float(data.get('cgpa', 0))
    if cgpa >= 9: score += 20
    elif cgpa >= 8: score += 16
    elif cgpa >= 7: score += 12
    elif cgpa >= 6: score += 8
    else: score += 4
    score += min(20, int(data.get('certifications', 0)) * 5)
    score += min(20, int(data.get('projects', 0)) * 4)
    score += min(15, int(data.get('internships', 0)) * 7)
    score += min(10, int(data.get('hackathons', 0)) * 4)
    score += min(15, float(data.get('programming_skill', 0)) * 1.5)
    return min(100, round(score, 1))

def generate_suggestions(profile):
    suggestions = []
    if profile.cgpa and profile.cgpa < 7.0:
        suggestions.append({'type': 'academic', 'priority': 'high', 'message': 'Focus on improving your CGPA. Aim for 7.5+ for better placement opportunities.', 'action': 'Study consistently and attend all classes'})
    if not profile.internships or profile.internships == 0:
        suggestions.append({'type': 'experience', 'priority': 'high', 'message': 'You have no internship experience. This significantly impacts placement chances.', 'action': 'Apply for internships on Internshala, LinkedIn'})
    if not profile.certifications or profile.certifications < 2:
        suggestions.append({'type': 'certification', 'priority': 'medium', 'message': 'Add more certifications to your profile. Companies value certified skills.', 'action': 'Complete at least 2 certifications (AWS, Google, Microsoft)'})
    if not profile.projects or profile.projects < 2:
        suggestions.append({'type': 'projects', 'priority': 'high', 'message': 'Build more projects. Hands-on projects demonstrate practical skills.', 'action': 'Create 3-4 projects and host on GitHub'})
    if profile.communication_skill and profile.communication_skill < 6:
        suggestions.append({'type': 'communication', 'priority': 'medium', 'message': 'Your communication skills need improvement. This is crucial for interviews.', 'action': 'Practice mock interviews, join communication workshops'})
    if profile.programming_skill and profile.programming_skill < 6:
        suggestions.append({'type': 'coding', 'priority': 'high', 'message': 'Strengthen your programming skills. Most companies test coding ability.', 'action': 'Solve 2 LeetCode problems daily'})
    if profile.backlogs and profile.backlogs > 0:
        suggestions.append({'type': 'academic', 'priority': 'high', 'message': f'Clear your {profile.backlogs} active backlog(s). Many companies have a no-backlog policy.', 'action': 'Focus on clearing backlogs in the upcoming exams'})
    if profile.resume_score and profile.resume_score < 60:
        suggestions.append({'type': 'resume', 'priority': 'medium', 'message': 'Your resume score is low. A strong resume is the first step to placement.', 'action': 'Use professional resume templates and highlight key projects'})
    if not suggestions:
        suggestions.append({'type': 'general', 'priority': 'low', 'message': 'Great profile! Keep practicing coding problems and stay updated with industry trends.', 'action': 'Continue preparing and apply to companies matching your profile'})
    return suggestions

def get_grade(pct):
    if pct >= 90: return 'A+'
    elif pct >= 80: return 'A'
    elif pct >= 70: return 'B'
    elif pct >= 60: return 'C'
    elif pct >= 50: return 'D'
    return 'F'

# ─── Init ─────────────────────────────────────────────────
with app.app_context():
    db.create_all()
    load_model()

if __name__ == '__main__':
    print("Starting AI Placement System Backend...")
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
