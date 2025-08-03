import json
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors
import joblib
import os

print("Starting model pre-computation...")

# Define paths
PUBLIC_DIR = "public"
DATASET_PATH = os.path.join(PUBLIC_DIR, "dataset.json")
VECTORIZER_PATH = os.path.join(PUBLIC_DIR, "vectorizer.joblib")
MODEL_PATH = os.path.join(PUBLIC_DIR, "model.joblib")
ANSWERS_PATH = os.path.join(PUBLIC_DIR, "answers.json")

# 1. Load the dataset
with open(DATASET_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

df = pd.DataFrame(data)
df.fillna("", inplace=True)

questions = df["question"].tolist()
answers = df["answer"].tolist()

# 2. Train the models
print("Training TF-IDF vectorizer...")
vectorizer = TfidfVectorizer()
questions_vectorized = vectorizer.fit_transform(questions)

print("Training NearestNeighbors model...")
model = NearestNeighbors(n_neighbors=1, metric="cosine")
model.fit(questions_vectorized)

# 3. Save the trained models and answers
print(f"Saving vectorizer to {VECTORIZER_PATH}")
joblib.dump(vectorizer, VECTORIZER_PATH)

print(f"Saving model to {MODEL_PATH}")
joblib.dump(model, MODEL_PATH)

print(f"Saving answers to {ANSWERS_PATH}")
with open(ANSWERS_PATH, "w", encoding="utf-8") as f:
    json.dump(answers, f)

print("Pre-computation complete! ✨")
