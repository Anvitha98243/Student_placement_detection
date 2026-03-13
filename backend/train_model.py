"""
AI Student Placement Prediction - Model Training Script
Generates realistic synthetic dataset and trains ML pipeline
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, classification_report
from sklearn.pipeline import Pipeline
import joblib
import os
import json

np.random.seed(42)
N = 5000

def generate_dataset():
    branches = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIML', 'DS']
    branch_weights = [0.25, 0.15, 0.10, 0.12, 0.08, 0.15, 0.10, 0.05]

    branch = np.random.choice(branches, N, p=branch_weights)
    cgpa = np.clip(np.random.normal(7.2, 1.1, N), 4.0, 10.0)

    # Skills (0-10 scale)
    programming_skill = np.clip(np.random.normal(6, 2, N), 0, 10)
    communication_skill = np.clip(np.random.normal(6.5, 1.8, N), 0, 10)
    problem_solving = np.clip(np.random.normal(6.2, 1.9, N), 0, 10)
    teamwork = np.clip(np.random.normal(7, 1.5, N), 0, 10)
    leadership = np.clip(np.random.normal(5.5, 2, N), 0, 10)

    # Experience & extras
    internships = np.random.choice([0, 1, 2, 3], N, p=[0.3, 0.4, 0.2, 0.1])
    projects = np.random.choice([0, 1, 2, 3, 4, 5], N, p=[0.05, 0.2, 0.3, 0.25, 0.15, 0.05])
    certifications = np.random.choice([0, 1, 2, 3, 4], N, p=[0.15, 0.30, 0.30, 0.15, 0.10])
    hackathons = np.random.choice([0, 1, 2, 3], N, p=[0.4, 0.35, 0.18, 0.07])
    backlogs = np.random.choice([0, 1, 2, 3, 4], N, p=[0.55, 0.25, 0.10, 0.06, 0.04])

    # 10th and 12th percentage
    tenth_pct = np.clip(np.random.normal(78, 12, N), 40, 100)
    twelfth_pct = np.clip(np.random.normal(75, 13, N), 40, 100)

    # Resume score (0-100)
    resume_score = np.clip(
        (cgpa * 4) + (certifications * 5) + (projects * 4) + (internships * 6) +
        (programming_skill * 2) + np.random.normal(0, 5, N), 0, 100
    )

    # Aptitude test score
    aptitude_score = np.clip(
        problem_solving * 8 + np.random.normal(0, 8, N), 0, 100
    )

    # Coding score
    coding_score = np.clip(
        programming_skill * 8 + problem_solving * 2 + np.random.normal(0, 7, N), 0, 100
    )

    # Communication test score
    communication_test = np.clip(
        communication_skill * 9 + teamwork * 1 + np.random.normal(0, 6, N), 0, 100
    )

    # Placement probability formula (realistic)
    placement_score = (
        cgpa * 8 +
        programming_skill * 5 +
        communication_skill * 4 +
        problem_solving * 4 +
        internships * 10 +
        projects * 5 +
        certifications * 6 +
        hackathons * 4 +
        (resume_score * 0.3) +
        (aptitude_score * 0.2) +
        (tenth_pct * 0.1) +
        (twelfth_pct * 0.1) -
        backlogs * 8 +
        np.random.normal(0, 10, N)
    )

    # Normalize to 0-100
    placement_score = (placement_score - placement_score.min()) / (placement_score.max() - placement_score.min()) * 100

    # Binary placement (threshold ~55%)
    placed = (placement_score > 50).astype(int)

    df = pd.DataFrame({
        'branch': branch,
        'cgpa': np.round(cgpa, 2),
        'tenth_percentage': np.round(tenth_pct, 1),
        'twelfth_percentage': np.round(twelfth_pct, 1),
        'programming_skill': np.round(programming_skill, 1),
        'communication_skill': np.round(communication_skill, 1),
        'problem_solving': np.round(problem_solving, 1),
        'teamwork': np.round(teamwork, 1),
        'leadership': np.round(leadership, 1),
        'internships': internships,
        'projects': projects,
        'certifications': certifications,
        'hackathons': hackathons,
        'backlogs': backlogs,
        'resume_score': np.round(resume_score, 1),
        'aptitude_score': np.round(aptitude_score, 1),
        'coding_score': np.round(coding_score, 1),
        'communication_test': np.round(communication_test, 1),
        'placement_score': np.round(placement_score, 1),
        'placed': placed
    })

    return df

def train():
    print("Generating dataset...")
    df = generate_dataset()
    df.to_csv('data/placement_dataset.csv', index=False)
    print(f"Dataset: {len(df)} records, Placement rate: {df['placed'].mean()*100:.1f}%")

    # Encode branch
    le = LabelEncoder()
    df['branch_encoded'] = le.fit_transform(df['branch'])

    feature_cols = [
        'cgpa', 'tenth_percentage', 'twelfth_percentage',
        'programming_skill', 'communication_skill', 'problem_solving',
        'teamwork', 'leadership', 'internships', 'projects',
        'certifications', 'hackathons', 'backlogs',
        'resume_score', 'aptitude_score', 'coding_score',
        'communication_test', 'branch_encoded'
    ]

    X = df[feature_cols]
    y = df['placed']
    y_score = df['placement_score']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Train Gradient Boosting (best accuracy)
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('model', GradientBoostingClassifier(
            n_estimators=200, learning_rate=0.1,
            max_depth=5, random_state=42
        ))
    ])

    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {acc*100:.2f}%")
    print(classification_report(y_test, y_pred))

    # Save model and metadata
    os.makedirs('models', exist_ok=True)
    joblib.dump(pipeline, 'models/placement_model.pkl')
    joblib.dump(le, 'models/branch_encoder.pkl')

    metadata = {
        'accuracy': round(acc * 100, 2),
        'feature_cols': feature_cols,
        'branches': list(le.classes_),
        'training_samples': len(X_train),
        'test_samples': len(X_test)
    }
    with open('models/model_metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)

    print("Model saved!")
    return acc

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    os.makedirs('data', exist_ok=True)
    os.makedirs('models', exist_ok=True)
    train()
