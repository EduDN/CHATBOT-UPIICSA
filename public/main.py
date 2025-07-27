import json
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors

# Global variables to store the model and data once initialized
vectorizer = None
model = None
answers = None


def initialize_model(json_data_string):
    """
    Initializes the vectorizer and NearestNeighbors model
    with the knowledge base data.
    This function is called once from JavaScript.
    """
    global vectorizer, model, answers

    print("Python: Initializing model with received data...")

    # Load data from the JSON string passed by JavaScript
    data = json.loads(json_data_string)
    df = pd.DataFrame(data)

    # Ensure there are no null values
    df.fillna("", inplace=True)

    # Extract questions and answers
    questions = df["question"].tolist()
    answers = df["answer"].tolist()  # Storing answers in the global variable

    # Create and train the vectorizer
    vectorizer = TfidfVectorizer()
    questions_vectorized = vectorizer.fit_transform(questions)

    # Create and train the nearest neighbors model
    model = NearestNeighbors(n_neighbors=1, metric="cosine")
    model.fit(questions_vectorized)

    print("Python: Model initialized successfully.")


def get_answer(user_question):
    """
    Finds the most relevant answer for a given user question.
    """
    global vectorizer, model, answers

    # Check if the model has been initialized
    if model is None or vectorizer is None or answers is None:
        return "The model is not ready yet. Please wait a moment."

    # Vectorize the user's question
    question_vectorized = vectorizer.transform([user_question])

    # Find the nearest neighbor (the most similar question)
    distances, indices = model.kneighbors(question_vectorized)

    # If the similarity is too low, consider it a poor match
    if distances[0][0] > 0.55:
        return "Disculpa, No tengo información sobre eso."

    closest_index = indices[0][0]

    return answers[closest_index]
