from flask import Blueprint, request, jsonify
from nltk.corpus import words
import random
import requests
from datetime import date
from .models import Submission, db
import joblib
import os 

model_path = os.path.join(os.path.dirname(__file__), '..', 'tone_model.pkl')
tone_model = joblib.load(model_path)

all_words = words.words()
# tones = ["Melancholy", "Joyful", "Angry", "Hopeful", "Confused", "Peaceful"]



main = Blueprint('main', __name__)
def get_adjective_list():
    res = requests.get("https://api.datamuse.com/words?rel_jjb=thing&max=1000")
    if res.status_code != 200:
        return ["melancholy", "joyful", "angry"]  # fallback
    data = res.json()
    return [entry['word'] for entry in data]
adjectives = get_adjective_list()
@main.route('/get-daily-challenge', methods=['GET'])
def get_daily_challenge():
    today = str(date.today())  # '2025-06-15'
    random.seed(today)

    word_bank = random.sample(all_words, 3)
    tone = random.choice(adjectives)

    return jsonify({
        'wordBank': word_bank,
        'tone': tone
    })
@main.route('/submit-poem', methods=['POST'])
# def submit_poem():
#     data = request.get_json()
#     poem = data.get('poem', '')
#     tone = data.get('tone', '')
#     used_words = data.get('usedWords', [])

#     # Dummy tone prediction (pretending AI guessed wrong tone)
#     predicted_tone = "Joyful"
#     score = 50 if predicted_tone == tone else 20

#     return jsonify({
#         'predictedTone': predicted_tone,
#         'score': score
#     })
def submit_poem():
    data = request.get_json()
    username = data.get('username', 'anonymous')  # default if missing

    poem = data.get('poem', '')
    tone = data.get('tone', '')
    used_words = data.get('usedWords', [])


    today = date.today()
    existing = Submission.query.filter_by(username=username, date=today).first()
    if existing:
        return jsonify({"error": "You’ve already submitted a poem today."}), 403


    # Dummy prediction logic
    # predicted_tone = "Joyful"
    predicted_tone = tone_model.predict([poem])[0]

    score = 50 if predicted_tone == tone else 20

    # Save submission
    submission = Submission(
        username=username,
        poem=poem,
        tone=tone,
        used_words=",".join(used_words),
        predicted_tone=predicted_tone,
        score=score
    )
    db.session.add(submission)
    db.session.commit()

    return jsonify({
        'predictedTone': predicted_tone,
        'score': score
    })

# @main.route('/submissions', methods=['GET'])
# def get_submissions():
#     all_subs = Submission.query.order_by(Submission.date.desc()).all()
#     results = []
#     for sub in all_subs:
#         results.append({
#             "username": sub.username,
#             "poem": sub.poem,
#             "tone": sub.tone,
#             "usedWords": sub.used_words.split(","),
#             "predictedTone": sub.predicted_tone,
#             "score": sub.score,
#             "date": sub.date.isoformat()
#         })
#     return jsonify(results)
@main.route('/submissions', methods=['GET'])
def get_submissions():
    # Optional: filter by username or date
    username = request.args.get('username')
    date_filter = request.args.get('date')  # format: YYYY-MM-DD

    query = Submission.query

    if username:
        query = query.filter_by(username=username)

    if date_filter:
        try:
            from datetime import datetime
            parsed_date = datetime.strptime(date_filter, '%Y-%m-%d').date()
            query = query.filter_by(date=parsed_date)
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

    # Order by most recent first
    results = query.order_by(Submission.date.desc()).all()

    output = []
    for sub in results:
        output.append({
            "username": sub.username,
            "poem": sub.poem,
            "tone": sub.tone,
            "usedWords": sub.used_words.split(","),
            "predictedTone": sub.predicted_tone,
            "score": sub.score,
            "date": sub.date.isoformat()
        })

    return jsonify(output)
