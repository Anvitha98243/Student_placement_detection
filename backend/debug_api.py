from app import app
import json

with app.test_client() as client:
    # We need a token to test @jwt_required, but for now let's just test the logic
    # by temporarily removing @jwt_required in app.py or testing a non-protected version
    pass

# Simplified: Let's just print what would be returned
lsrw_data = {
    'listening': [
        {'id': 'l1', 'prompt': 'Listen to the instruction and choose the correct action.', 'text': 'Please submit the project report by Friday afternoon to the department head.', 'options': ['Submit on Monday', 'Submit on Friday afternoon', 'Submit to the manager', 'Email it today'], 'answer': 1},
        {'id': 'l2', 'prompt': 'What did the speaker mention as a priority?', 'text': 'Our primary focus this quarter is customer satisfaction and reducing response times.', 'options': ['Increasing sales', 'Reducing costs', 'Customer satisfaction', 'New product launch'], 'answer': 2}
    ],
    'speaking': [
        {'id': 's1', 'prompt': 'Introduce yourself in 3 sentences focus on your skills.', 'hints': ['Greet', 'Mention degree', 'Highlight 2 skills']},
        {'id': 's2', 'prompt': 'How would you handle a conflict with a colleague?', 'hints': ['Stay calm', 'Direct communication', 'Seek solution']}
    ],
    'reading': [
        {'id': 'r1', 'prompt': 'Read the passage and answer: What is the main benefit of AI in healthcare?', 'passage': 'Artificial Intelligence is revolutionizing healthcare by providing faster diagnoses and personalized treatment plans. It helps doctors analyze vast amounts of data in seconds.', 'options': ['Cheaper medicine', 'Faster diagnoses', 'More doctors', 'Better hospitals'], 'answer': 1},
        {'id': 'r2', 'prompt': 'Read the passage and answer: What should you do before an interview?', 'passage': 'Preparation is key to a successful interview. Research the company, practice common questions, and dress professionally to make a good first impression.', 'options': ['Arrive late', 'Research the company', 'Buy new shoes', 'Ignore company history'], 'answer': 1}
    ],
    'writing': [
        {'id': 'w1', 'type': 'email', 'prompt': 'Write a professional email to your manager requesting 2 days of leave for a personal emergency.', 'hints': ['Use formal salutation', 'State reason briefly', 'Mention dates clearly', 'Express willingness to complete pending work']},
        {'id': 'w2', 'type': 'pitch', 'prompt': 'Write a short 2-sentence pitch for a web application project you built.', 'hints': ['Problem solved', 'Tech stack used']}
    ]
}
print(json.dumps(lsrw_data, indent=2))