from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Submission(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)  # ✅ NEW FIELD

    poem = db.Column(db.Text, nullable=False)
    tone = db.Column(db.String(100), nullable=False)
    used_words = db.Column(db.Text, nullable=False)  # store as comma-separated string
    predicted_tone = db.Column(db.String(100), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    date = db.Column(db.Date, default=datetime.utcnow().date)
