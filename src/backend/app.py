#!/usr/bin/env python3
"""
Stanzle Game Main Application
Professional Flask-based web application
"""

import os
import sys
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Add the project root to Python path
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(project_root)

from src.backend.services.wordnik_service import WordnikService
from src.backend.services.openai_service import OpenAIService
from src.backend.utils.validators import validate_poem_data
from config.settings import Config

# Load environment variables
load_dotenv()

def create_app():
    """Application factory pattern"""
    app = Flask(__name__, 
                static_folder='../../public',
                template_folder='../../public')
    
    # Configure CORS
    CORS(app, origins=['http://localhost:3000', 'http://localhost:8000'])
    
    # Load configuration
    app.config.from_object(Config)
    
    # Initialize services
    wordnik_service = WordnikService()
    openai_service = OpenAIService()
    
    @app.route('/')
    def index():
        """Serve the main game page"""
        return render_template('index.html')
    
    @app.route('/api/challenge', methods=['GET'])
    def get_daily_challenge():
        """Get a new daily challenge"""
        try:
            challenge = wordnik_service.generate_daily_challenge()
            return jsonify({
                'success': True,
                'challenge': challenge
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    @app.route('/api/analyze', methods=['POST'])
    def analyze_poem():
        """Analyze poem for theme/emotion"""
        try:
            data = request.get_json()
            print(f"Analyze request data: {data}")  # Debug logging
            if not validate_poem_data(data):
                print(f"Validation failed for data: {data}")  # Debug logging
                return jsonify({'error': 'Invalid poem data'}), 400
            
            result = openai_service.analyze_poem(
                poem=data['poem'],
                mode=data.get('mode', 'hard'),
                focus=data.get('focus')
            )
            
            return jsonify({
                'success': True,
                'result': result
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    @app.route('/api/score', methods=['POST'])
    def score_poem():
        """Score poem based on criteria"""
        try:
            data = request.get_json()
            print(f"Score request data: {data}")  # Debug logging
            if not validate_poem_data(data):
                print(f"Validation failed for data: {data}")  # Debug logging
                return jsonify({'error': 'Invalid poem data'}), 400
            
            result = openai_service.score_poem(
                poem=data['poem'],
                intended_theme=data['intended_theme'],
                intended_emotion=data['intended_emotion'],
                ai_guess=data['ai_guess'],
                difficulty=data.get('difficulty', 'easy'),
                focus=data.get('focus')
            )
            
            return jsonify({
                'success': True,
                'result': result
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=8000, debug=True)
