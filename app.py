import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- Configuration ---
# Get your Gemini API key from environment variables
# It's HIGHLY recommended to use environment variables or a .env file
# for sensitive information like API keys.
GEMINI_API_KEY = GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables. Please set it.")

# Configure the Gemini API
genai.configure(api_key=GEMINI_API_KEY)

# Initialize the Gemini model
# You can choose different models like 'gemini-pro', 'gemini-1.5-pro-latest', etc.
# 'gemini-pro' is a good general-purpose model for chat.
model = genai.GenerativeModel('gemini-1.5-flash')

# Start a chat session
# This allows for multi-turn conversations where the model remembers context.
chat_session = model.start_chat(history=[])

# --- Flask App Setup ---
app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# --- API Route for Chat ---
@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Receives a message from the frontend, sends it to Gemini, and returns the response.
    Expects a JSON payload like: {"message": "Hello Gemini!"}
    """
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({"error": "Invalid request: 'message' key missing in JSON payload."}), 400

        user_message = data['message']
        print(f"Received message from frontend: {user_message}")

        # Send message to Gemini and get response
        response = chat_session.send_message(user_message)
        gemini_response_text = response.text

        print(f"Gemini response: {gemini_response_text}")

        return jsonify({"response": gemini_response_text})

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": str(e)}), 500

# --- Health Check / Root Route ---
@app.route('/')
def home():
    return "Gemini Chat Backend is running!"

# --- Run the Flask App ---
if __name__ == '__main__':
    # You can change the port if 5000 is occupied
    app.run(debug=True, port=5000)
