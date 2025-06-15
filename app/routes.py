from flask import Blueprint, request, jsonify
from nltk.corpus import words
import random
import requests
from datetime import date

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
def submit_poem():
    data = request.get_json()
    poem = data.get('poem', '')
    tone = data.get('tone', '')
    used_words = data.get('usedWords', [])

    # Dummy tone prediction (pretending AI guessed wrong tone)
    predicted_tone = "Joyful"
    score = 50 if predicted_tone == tone else 20

    return jsonify({
        'predictedTone': predicted_tone,
        'score': score
    })
