#!/usr/bin/env python3
"""
Stanzle Game Main Entry Point
Simple entry point for the restructured application
"""

import os
import re
import sys
import secrets
import requests
from datetime import datetime, timedelta
from flask import Flask, render_template, request, jsonify, redirect, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from functools import wraps

# Load environment variables
load_dotenv()

# Add current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import services
from src.backend.services.wordnik_service import WordnikService
from src.backend.services.openai_service import OpenAIService
from src.backend.services.auth_service import AuthService
from src.backend.services.challenge_tracker import ChallengeTracker
from src.backend.utils.validators import validate_poem_data

# Initialize Flask app
app = Flask(__name__, 
            static_folder='public',
            template_folder='public',
            static_url_path='')

# Configure CORS
CORS(app, origins=['http://localhost:3000', 'http://localhost:8000'])

# Initialize services
wordnik_service = WordnikService()
openai_service = OpenAIService()
auth_service = AuthService()
challenge_tracker = ChallengeTracker()

# Authentication decorator
def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            token = request.cookies.get('authToken')
        
        user = auth_service.verify_token(token)
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        request.user = user
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    """Serve the main game page or redirect to landing"""
    # Check if user is authenticated
    token = request.cookies.get('authToken')
    print(f"🔍 Auth check - Token: {token[:20] if token else 'None'}...")
    print(f"🔍 All cookies: {request.cookies}")
    
    if not token:
        print("🔍 No token found, serving landing page")
        return render_template('landing.html')
    
    user = auth_service.verify_token(token)
    print(f"🔍 User verification result: {user is not None}")
    
    if not user:
        print("🔍 Token verification failed, serving landing page")
        return render_template('landing.html')
    
    print(f"🔍 User authenticated successfully: {user.get('username', 'Unknown')}")
    return render_template('index.html')

@app.route('/landing')
def landing():
    """Serve the landing page"""
    return render_template('landing.html')

@app.route('/unlimited')
def unlimited():
    """Serve the unlimited mode page"""
    return render_template('unlimited.html')

@app.route('/profile')
def profile():
    """Serve the profile page"""
    return render_template('profile.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files"""
    return app.send_static_file(filename)

# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if not all([username, email, password]):
            return jsonify({
                'success': False,
                'message': 'Missing required fields'
            }), 400
        
        result = auth_service.register_user(username, email, password)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Registration failed'
        }), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login a user"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not all([username, password]):
            return jsonify({
                'success': False,
                'message': 'Missing username or password'
            }), 400
        
        result = auth_service.login_user(username, password)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Login failed'
        }), 500

@app.route('/api/auth/logout', methods=['POST'])
@require_auth
def logout():
    """Logout a user"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            token = request.cookies.get('authToken')
        
        success = auth_service.logout_user(token)
        return jsonify({
            'success': success,
            'message': 'Logged out successfully' if success else 'Logout failed'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Logout failed'
        }), 500

@app.route('/api/auth/verify', methods=['GET'])
@require_auth
def verify():
    """Verify user token"""
    return jsonify({
        'success': True,
        'user': request.user
    })

@app.route('/api/auth/email-login', methods=['POST'])
def email_login():
    """Email-based login (simplified for demo)"""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({
                'success': False,
                'message': 'Email is required'
            }), 400
        
        # For demo purposes, create a temporary user
        username = email.split('@')[0]
        
        # Check if user exists, if not create one
        users = auth_service._load_users()
        if username not in users:
            # Create new user with email
            user_data = {
                'username': username,
                'email': email,
                'password_hash': auth_service._hash_password('temp_password'),
                'created_at': datetime.now().isoformat(),
                'last_login': None,
                'games_played': 0,
                'total_score': 0,
                'best_score': 0
            }
            users[username] = user_data
            auth_service._save_users(users)
        
        # Create session
        session_token = secrets.token_urlsafe(32)
        print(f"🔍 Email login - Created token: {session_token[:20]}...")
        sessions = auth_service._load_sessions()
        
        sessions[session_token] = {
            'username': username,
            'created_at': datetime.now().isoformat(),
            'expires_at': (datetime.now() + timedelta(days=7)).isoformat()
        }
        auth_service._save_sessions(sessions)
        print(f"🔍 Email login - Saved session for {username}")
        
        response = jsonify({
            'success': True,
            'message': 'Login successful',
            'token': session_token,
            'user': {
                'username': username,
                'email': email,
                'created_at': users[username]['created_at'],
                'games_played': users[username]['games_played'],
                'total_score': users[username]['total_score'],
                'best_score': users[username]['best_score']
            }
        })
        
        # Set the cookie
        response.set_cookie('authToken', session_token, max_age=7*24*60*60, path='/')
        return response
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Email login failed'
        }), 500

@app.route('/login/google')
def google_login():
    """Initiate Google OAuth login"""
    client_id = os.getenv('GOOGLE_CLIENT_ID')
    redirect_uri = 'http://localhost:8000/login/google/authorized'
    
    # Create the authorization URL
    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={client_id}&"
        f"redirect_uri={redirect_uri}&"
        f"scope=openid%20email%20profile&"
        f"response_type=code&"
        f"access_type=offline"
    )
    
    return redirect(auth_url)

@app.route('/username')
def username_setup():
    """Serve username selection page for new Google users"""
    return send_from_directory('public', 'username.html')

@app.route('/api/auth/setup-google-user', methods=['POST'])
def setup_google_user():
    """Complete Google user setup with chosen username"""
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        
        if not username:
            return jsonify({
                'success': False,
                'message': 'Username is required'
            }), 400
        
        # Validate username
        if len(username) < 3 or len(username) > 20:
            return jsonify({
                'success': False,
                'message': 'Username must be 3-20 characters long'
            }), 400
        
        if not re.match(r'^[a-zA-Z0-9_]+$', username):
            return jsonify({
                'success': False,
                'message': 'Username can only contain letters, numbers, and underscores'
            }), 400
        
        # Check if username is already taken
        users = auth_service._load_users()
        if username in users:
            return jsonify({
                'success': False,
                'message': 'Username is already taken'
            }), 400
        
        # Get Google user info from request data
        email = data.get('email', '')
        name = data.get('name', '')
        
        user_data = {
            'username': username,
            'email': email,
            'password_hash': auth_service._hash_password('google_oauth'),
            'created_at': datetime.now().isoformat(),
            'last_login': None,
            'games_played': 0,
            'total_score': 0,
            'best_score': 0
        }
        
        users[username] = user_data
        auth_service._save_users(users)
        
        # Create session
        session_token = secrets.token_urlsafe(32)
        sessions = auth_service._load_sessions()
        
        sessions[session_token] = {
            'username': username,
            'created_at': datetime.now().isoformat(),
            'expires_at': (datetime.now() + timedelta(days=7)).isoformat()
        }
        auth_service._save_sessions(sessions)
        
        print(f"🔍 Google user setup: Created user {username}")
        
        response = jsonify({
            'success': True,
            'message': 'Account created successfully',
            'token': session_token,
            'user': {
                'username': username,
                'email': user_data['email'],
                'created_at': user_data['created_at'],
                'games_played': user_data['games_played'],
                'total_score': user_data['total_score'],
                'best_score': user_data['best_score']
            }
        })
        
        # Set the cookie
        response.set_cookie('authToken', session_token, max_age=7*24*60*60, path='/', secure=False, httponly=False)
        print(f"🔍 Google user setup: Set cookie and returning response")
        
        return response
        
    except Exception as e:
        print(f"Google user setup error: {e}")
        return jsonify({
            'success': False,
            'message': 'Failed to create account'
        }), 500

@app.route('/login/google/authorized')
def google_callback():
    """Handle Google OAuth callback"""
    try:
        code = request.args.get('code')
        client_id = os.getenv('GOOGLE_CLIENT_ID')
        client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
        redirect_uri = 'http://localhost:8000/login/google/authorized'
        
        if not code:
            return redirect('/landing?error=no_code')
        
        # Exchange code for token
        token_url = 'https://oauth2.googleapis.com/token'
        token_data = {
            'client_id': client_id,
            'client_secret': client_secret,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': redirect_uri
        }
        
        token_response = requests.post(token_url, data=token_data)
        token_json = token_response.json()
        
        if 'access_token' not in token_json:
            return redirect('/landing?error=token_failed')
        
        access_token = token_json['access_token']
        
        # Get user info
        user_info_url = f'https://www.googleapis.com/oauth2/v2/userinfo?access_token={access_token}'
        user_response = requests.get(user_info_url)
        user_info = user_response.json()
        
        # Create or find user
        email = user_info.get('email')
        username = email.split('@')[0] if email else f"google_user_{secrets.token_hex(4)}"
        
        # Check if user exists by email first, then by username
        users = auth_service._load_users()
        existing_user = None
        existing_username = None
        
        # Look for existing user by email
        for user_key, user_data in users.items():
            if user_data.get('email') == email:
                existing_user = user_data
                existing_username = user_key
                break
        
        print(f"🔍 Google OAuth: Email {email}, existing_user: {existing_username}")
        
        if existing_user:
            # Use existing user - create session and redirect to main page
            username = existing_username
            print(f"🔍 Google OAuth: Found existing user by email: {username}")
            
            # Create session for existing user
            session_token = secrets.token_urlsafe(32)
            sessions = auth_service._load_sessions()
            
            sessions[session_token] = {
                'username': username,
                'created_at': datetime.now().isoformat(),
                'expires_at': (datetime.now() + timedelta(days=7)).isoformat()
            }
            auth_service._save_sessions(sessions)
            
            print(f"🔍 Google OAuth: Created session token: {session_token[:20]}... for existing user: {username}")
            
            # Set cookie and redirect to main page
            response = redirect('/')
            response.set_cookie('authToken', session_token, max_age=7*24*60*60, path='/', secure=False, httponly=False)
            print(f"🔍 Google OAuth: Set cookie and redirecting to /")
            return response
        else:
            # New user - redirect to username selection page
            print(f"🔍 Google OAuth: New user detected, redirecting to username selection")
            
            # Check if user is already authenticated (they might have completed setup)
            existing_token = request.cookies.get('authToken')
            if existing_token:
                print(f"🔍 Google OAuth: User already has auth token, checking if valid")
                user = auth_service.verify_token(existing_token)
                if user:
                    print(f"🔍 Google OAuth: User already authenticated, redirecting to main page")
                    return redirect('/')
            
            # Store Google user info in session for username setup
            temp_session_token = secrets.token_urlsafe(32)
            temp_sessions = auth_service._load_sessions()
            
            # Store Google user info temporarily
            temp_sessions[temp_session_token] = {
                'google_user': True,
                'email': email,
                'name': user_info.get('name', ''),
                'created_at': datetime.now().isoformat(),
                'expires_at': (datetime.now() + timedelta(hours=1)).isoformat()  # Short expiry for setup
            }
            auth_service._save_sessions(temp_sessions)
            
            # Redirect to username selection page with Google user info
            redirect_url = f'/username?email={email}&name={user_info.get("name", "")}&token={temp_session_token}'
            return redirect(redirect_url)
        
    except Exception as e:
        print(f"Google OAuth error: {e}")
        return redirect('/landing?error=google_auth_failed')

@app.route('/api/challenge', methods=['GET'])
def get_daily_challenge():
    """Get a new daily challenge"""
    try:
        challenge = wordnik_service.generate_daily_challenge()
        
        # Track the challenge for archive purposes
        challenge_tracker.track_challenge(challenge)
        
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
        if not validate_poem_data(data):
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
        print(f"🔍 Score API - Request data: {data}")  # Debug logging
        
        if not validate_poem_data(data):
            return jsonify({'error': 'Invalid poem data'}), 400
        
        result = openai_service.score_poem(
            poem=data['poem'],
            intended_theme=data['intended_theme'],
            intended_emotion=data['intended_emotion'],
            ai_guess=data['ai_guess'],
            difficulty=data.get('difficulty', 'easy'),
            focus=data.get('focus')
        )
        
        print(f"🔍 Score API - Result: {result}")  # Debug logging
        
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

@app.route('/api/daily/submission-status', methods=['GET'])
@require_auth
def get_daily_submission_status():
    """Check if user can submit today's daily challenge"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        user_data = auth_service.verify_token(token)
        
        if not user_data:
            return jsonify({'success': False, 'error': 'Invalid token'}), 401
        
        username = user_data['username']
        status = auth_service.get_daily_submission_status(username)
        
        return jsonify(status)
    
    except Exception as e:
        print(f"Error in daily submission status endpoint: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@app.route('/api/daily/submit', methods=['POST'])
@require_auth
def submit_daily_score():
    """Submit daily score"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        print(f"🔍 Daily submit - Token: {token[:20] if token else 'None'}...")
        
        user_data = auth_service.verify_token(token)
        print(f"🔍 Daily submit - User data: {user_data is not None}")
        
        if not user_data:
            return jsonify({'success': False, 'error': 'Invalid token'}), 401
        
        data = request.get_json()
        print(f"🔍 Daily submit - Request data: {data}")
        
        score = data.get('score')
        print(f"🔍 Daily submit - Score: {score} (type: {type(score)})")
        
        if score is None or not isinstance(score, (int, float)):
            print(f"🔍 Daily submit - Score validation failed: {score} is not valid")
            return jsonify({'success': False, 'error': 'Invalid score'}), 400
        
        username = user_data['username']
        
        # Extract detailed submission data
        submission_data = {
            'mode': data.get('mode', 'hard'),
            'easy_selection': data.get('easy_selection'),
            'word_bank_used': data.get('word_bank_used', False),
            'theme': data.get('theme', ''),
            'emotion': data.get('emotion', ''),
            'required_words': data.get('required_words', []),
            'poem_text': data.get('poem_text', ''),
            'poem_html': data.get('poem_html', ''),
            'ai_guess': data.get('ai_guess', {})
        }
        
        result = auth_service.submit_daily_score(username, int(score), submission_data)
        
        # Update challenge statistics
        if result.get('success'):
            today = datetime.now().strftime('%Y-%m-%d')
            # Get current stats and update them
            current_challenge = challenge_tracker.get_challenge_by_date(today)
            if current_challenge:
                new_submissions = current_challenge.get('submissions_count', 0) + 1
                current_avg = current_challenge.get('avg_score', 0.0)
                new_avg = ((current_avg * (new_submissions - 1)) + int(score)) / new_submissions
                best_score = max(current_challenge.get('best_score', 0), int(score))
                
                challenge_tracker.update_challenge_stats(
                    today, 
                    submissions_count=new_submissions,
                    avg_score=new_avg,
                    best_score=best_score
                )
        
        return jsonify(result)
    
    except Exception as e:
        print(f"Error in daily score submission endpoint: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@app.route('/api/user/submission-history', methods=['GET'])
@require_auth
def get_submission_history():
    """Get user's detailed submission history"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        user_data = auth_service.verify_token(token)
        
        if not user_data:
            return jsonify({'success': False, 'error': 'Invalid token'}), 401
        
        username = user_data['username']
        result = auth_service.get_submission_history(username)
        
        return jsonify(result)
    
    except Exception as e:
        print(f"Error in submission history endpoint: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@app.route('/api/daily/history', methods=['GET'])
@require_auth
def get_daily_score_history():
    """Get user's daily score history"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        user_data = auth_service.verify_token(token)
        
        if not user_data:
            return jsonify({'success': False, 'error': 'Invalid token'}), 401
        
        username = user_data['username']
        history = auth_service.get_daily_score_history(username)
        
        return jsonify(history)
    
    except Exception as e:
        print(f"Error in daily score history endpoint: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@app.route('/api/archive/challenges', methods=['GET'])
def get_challenge_archive():
    """Get all tracked challenges for archive mode"""
    try:
        challenges = challenge_tracker.get_all_challenges()
        return jsonify({
            'success': True,
            'challenges': challenges
        })
    except Exception as e:
        print(f"Error in challenge archive endpoint: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@app.route('/api/archive/challenge/<date>', methods=['GET'])
def get_challenge_by_date(date):
    """Get a specific challenge by date (YYYY-MM-DD format)"""
    try:
        challenge = challenge_tracker.get_challenge_by_date(date)
        if challenge:
            return jsonify({
                'success': True,
                'challenge': challenge
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Challenge not found for the specified date'
            }), 404
    except Exception as e:
        print(f"Error in get challenge by date endpoint: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@app.route('/api/archive/export', methods=['GET'])
def export_challenges():
    """Export all challenges to CSV"""
    try:
        output_file = challenge_tracker.export_challenges_csv()
        return jsonify({
            'success': True,
            'message': f'Challenges exported to {output_file}',
            'file_path': output_file
        })
    except Exception as e:
        print(f"Error in export challenges endpoint: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@app.route('/api/archive/track', methods=['POST'])
def track_challenge():
    """Track a challenge for archive purposes"""
    try:
        data = request.get_json()
        print(f"DEBUG: Received challenge data: {data}")
        
        # Track the challenge
        success = challenge_tracker.track_challenge(data)
        
        if success:
            print("DEBUG: Challenge tracked successfully")
            return jsonify({'success': True, 'message': 'Challenge tracked successfully'})
        else:
            print("DEBUG: Failed to track challenge")
            return jsonify({'success': False, 'error': 'Failed to track challenge'}), 500
            
    except Exception as e:
        print(f"Error in track challenge endpoint: {e}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("🎭 Starting Stanzle Poetry Game...")
    print("📁 Serving static files from: public/")
    print("🌐 Server will be available at: http://localhost:8000")
    print("🛑 Press Ctrl+C to stop the server")
    print("")
    
    app.run(host='0.0.0.0', port=8000, debug=True)
