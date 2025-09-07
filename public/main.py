import joblib
import json

# Global variables to hold the loaded models and data
vectorizer = None
model = None
answers = None


def initialize_model():
    """
    Loads the pre-trained models and answers from files.
    """
    global vectorizer, model, answers

    print("Python: Loading pre-trained models...")

    # These files will be loaded into Pyodide's virtual filesystem by JavaScript
    vectorizer = joblib.load("vectorizer.joblib")
    model = joblib.load("model.joblib")

    with open("answers.json", "r") as f:
        answers = json.load(f)

    print("Python: Models loaded successfully.")


def get_answer(user_question):
    """
    Finds the most relevant answer using the pre-trained models.
    """
    if model is None or vectorizer is None or answers is None:
        return "The model is not ready yet. Please wait a moment."

    question_vectorized = vectorizer.transform([user_question])
    distances, indices = model.kneighbors(question_vectorized)

    if distances[0][0] > 0.5:
        return "I'm sorry, I don't have information about that."

    closest_index = indices[0][0]
    return answers[closest_index]
