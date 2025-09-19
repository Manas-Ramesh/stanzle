#!/usr/bin/env python3
"""
Stanzle Game Server
Handles OpenAI API integration for poem analysis and scoring
"""

import os
import json
import asyncio
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import openai
from datetime import datetime
from dotenv import load_dotenv
from wordnik_integration import WordnikIntegration

# Load environment variables from .env file
load_dotenv()

# Configure OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

# Initialize Wordnik integration
wordnik = WordnikIntegration()

class StanzleHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        """Handle GET requests - serve static files"""
        try:
            # Parse the URL path
            parsed_path = urlparse(self.path)
            path = parsed_path.path
            
            # Default to index.html for root path
            if path == '/':
                path = '/index.html'
            
            # Remove leading slash and serve file
            file_path = path[1:] if path.startswith('/') else path
            
            # Security check - only serve files in current directory
            if '..' in file_path or file_path.startswith('/'):
                self.send_error(403, "Forbidden")
                return
            
            # Try to read and serve the file
            try:
                with open(file_path, 'rb') as f:
                    content = f.read()
                
                # Set appropriate content type
                content_type = self.get_content_type(file_path)
                
                self.send_response(200)
                self.send_header('Content-Type', content_type)
                self.send_header('Content-Length', str(len(content)))
                self.end_headers()
                self.wfile.write(content)
                
            except FileNotFoundError:
                self.send_error(404, "File not found")
                
        except Exception as e:
            self.send_error(500, f"Server error: {str(e)}")

    def do_POST(self):
        """Handle POST requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Type', 'application/json')
        self.end_headers()

        # Parse the request
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
            response = self.handle_request(data)
            self.wfile.write(json.dumps(response).encode('utf-8'))
        except Exception as e:
            error_response = {'error': str(e)}
            self.wfile.write(json.dumps(error_response).encode('utf-8'))

    def get_content_type(self, file_path):
        """Get content type based on file extension"""
        if file_path.endswith('.html'):
            return 'text/html'
        elif file_path.endswith('.css'):
            return 'text/css'
        elif file_path.endswith('.js'):
            return 'application/javascript'
        elif file_path.endswith('.json'):
            return 'application/json'
        elif file_path.endswith('.png'):
            return 'image/png'
        elif file_path.endswith('.jpg') or file_path.endswith('.jpeg'):
            return 'image/jpeg'
        elif file_path.endswith('.gif'):
            return 'image/gif'
        else:
            return 'text/plain'

    def handle_request(self, data):
        """Route requests based on action"""
        action = data.get('action')
        
        if action == 'analyze_poem':
            return self.analyze_poem(data)
        elif action == 'score_poem':
            return self.score_poem(data)
        elif action == 'get_daily_challenge':
            return self.get_daily_challenge()
        else:
            return {'error': 'Invalid action'}

    def analyze_poem(self, data):
        """Use OpenAI to analyze poem and guess theme/emotion"""
        poem_content = data.get('poem', '')
        mode = data.get('mode', 'hard')
        focus = data.get('focus', None)
        
        if mode == 'easy' and focus:
            # Easy mode - only analyze the selected focus
            if focus == 'theme':
                prompt = f"""
                Analyze this poem and determine what THEME it represents.
                Consider the main subject, topic, or central idea of the poem.
                
                Return your response as a JSON object with the following structure:
                {{
                    "theme": "the main theme or subject",
                    "confidence": 0.85
                }}
                
                Poem:
                {poem_content}
                """
            else:  # focus == 'emotion'
                prompt = f"""
                Analyze this poem and determine what EMOTION it conveys.
                Consider the mood, feeling, or emotional tone of the poem.
                
                Return your response as a JSON object with the following structure:
                {{
                    "emotion": "the primary emotion conveyed",
                    "confidence": 0.85
                }}
                
                Poem:
                {poem_content}
                """
        else:
            # Hard mode - analyze both theme and emotion
            prompt = f"""
            Analyze this poem and determine what theme and emotion it represents.
            Consider the overall mood, imagery, and message of the poem.
            
            Return your response as a JSON object with the following structure:
            {{
                "theme": "the main theme or subject",
                "emotion": "the primary emotion conveyed",
                "confidence": 0.85
            }}
            
            Poem:
            {poem_content}
            """
        
        try:
            client = openai.OpenAI()
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert poetry analyst. Always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=200
            )
            
            result = json.loads(response.choices[0].message.content)
            return {'success': True, 'result': result}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def score_poem(self, data):
        """Use OpenAI to score the poem based on theme/emotion match and creativity"""
        poem_content = data.get('poem', '')
        intended_theme = data.get('intended_theme', '')
        intended_emotion = data.get('intended_emotion', '')
        ai_guess = data.get('ai_guess', {})
        difficulty = data.get('difficulty', 'easy')
        focus = data.get('focus', None)
        
        if difficulty == 'easy' and focus:
            # Easy mode - only score the selected focus
            if focus == 'theme':
                prompt = f"""
                Score this poem based on the following criteria:
                
                1. Theme Match: How well does the poem match the intended theme "{intended_theme}"?
                   AI guessed theme: "{ai_guess.get('theme', '')}"
                
                2. Creativity: How creative, original, and well-crafted is the poem?
                   Consider: originality, word choice, imagery, structure, and poetic devices.
                   NOTE: If the poem only uses basic word bank words without creative elaboration, 
                   give lower creativity scores (0-8). Higher scores (9-20) for creative word usage, 
                   metaphors, unique imagery, and poetic techniques.
                
                Scoring:
                - Theme Match: 0-80 points
                - Creativity: 0-20 points
                
                Return your response as a JSON object:
                {{
                    "themeScore": 0-80,
                    "creativityScore": 0-20,
                    "feedback": "detailed feedback about the poem",
                    "totalScore": "sum of all scores"
                }}
                
                Poem:
                {poem_content}
                """
            else:  # focus == 'emotion'
                prompt = f"""
                Score this poem based on the following criteria:
                
                1. Emotion Match: How well does the poem convey the intended emotion "{intended_emotion}"?
                   AI guessed emotion: "{ai_guess.get('emotion', '')}"
                
                2. Creativity: How creative, original, and well-crafted is the poem?
                   Consider: originality, word choice, imagery, structure, and poetic devices.
                   NOTE: If the poem only uses basic word bank words without creative elaboration, 
                   give lower creativity scores (0-8). Higher scores (9-20) for creative word usage, 
                   metaphors, unique imagery, and poetic techniques.
                
                Scoring:
                - Emotion Match: 0-80 points
                - Creativity: 0-20 points
                
                Return your response as a JSON object:
                {{
                    "emotionScore": 0-80,
                    "creativityScore": 0-20,
                    "feedback": "detailed feedback about the poem",
                    "totalScore": "sum of all scores"
                }}
                
                Poem:
                {poem_content}
                """
        else:
            # Hard mode - score both theme and emotion
            prompt = f"""
            Score this poem based on the following criteria:
            
            1. Theme Match: How well does the poem match the intended theme "{intended_theme}"?
               AI guessed theme: "{ai_guess.get('theme', '')}"
            
            2. Emotion Match: How well does the poem convey the intended emotion "{intended_emotion}"?
               AI guessed emotion: "{ai_guess.get('emotion', '')}"
            
            3. Creativity: How creative, original, and well-crafted is the poem?
               Consider: originality, word choice, imagery, structure, and poetic devices.
               NOTE: If the poem only uses basic word bank words without creative elaboration, 
               give lower creativity scores (0-8). Higher scores (9-20) for creative word usage, 
               metaphors, unique imagery, and poetic techniques.
            
            Scoring:
            - Theme Match: 0-40 points
            - Emotion Match: 0-40 points  
            - Creativity: 0-20 points
            
            Return your response as a JSON object:
            {{
                "themeScore": 0-40,
                "emotionScore": 0-40,
                "creativityScore": 0-20,
                "feedback": "detailed feedback about the poem",
                "totalScore": "sum of all scores"
            }}
            
            Poem:
            {poem_content}
            """
        
        try:
            client = openai.OpenAI()
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert poetry critic. Always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=300
            )
            
            result = json.loads(response.choices[0].message.content)
            return {'success': True, 'result': result}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def get_daily_challenge(self):
        """Get a new daily challenge from Wordnik"""
        try:
            challenge = wordnik.generate_daily_challenge()
            return {'success': True, 'challenge': challenge}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def log_message(self, format, *args):
        """Override to prevent default logging"""
        pass

def run_server(port=8000):
    """Start the server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, StanzleHandler)
    print(f"Stanzle server running on port {port}")
    print("Make sure to set your OPENAI_API_KEY environment variable")
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()
