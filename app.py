from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message')

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    # Simulate Gemini response (actual API call will be in a later step)
    bot_response = f"Gemini says: I received '{user_message}'" 

    return jsonify({"reply": bot_response})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
