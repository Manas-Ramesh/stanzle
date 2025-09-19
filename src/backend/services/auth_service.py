"""
Authentication Service for Stanzle Game
Handles user registration, login, and session management
"""

import hashlib
import secrets
import json
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

class AuthService:
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.users_file = os.path.join(data_dir, "users.json")
        self.sessions_file = os.path.join(data_dir, "sessions.json")
        
        # Create data directory if it doesn't exist
        os.makedirs(data_dir, exist_ok=True)
        
        # Initialize files if they don't exist
        self._init_files()
    
    def _init_files(self):
        """Initialize data files if they don't exist"""
        if not os.path.exists(self.users_file):
            with open(self.users_file, 'w') as f:
                json.dump({}, f)
        
        if not os.path.exists(self.sessions_file):
            with open(self.sessions_file, 'w') as f:
                json.dump({}, f)
    
    def _hash_password(self, password: str) -> str:
        """Hash password using SHA-256 with salt"""
        salt = secrets.token_hex(16)
        password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
        return f"{salt}:{password_hash}"
    
    def _verify_password(self, password: str, stored_hash: str) -> bool:
        """Verify password against stored hash"""
        try:
            salt, password_hash = stored_hash.split(':')
            test_hash = hashlib.sha256((password + salt).encode()).hexdigest()
            return test_hash == password_hash
        except ValueError:
            return False
    
    def _load_users(self) -> Dict[str, Any]:
        """Load users from file"""
        try:
            with open(self.users_file, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {}
    
    def _save_users(self, users: Dict[str, Any]):
        """Save users to file"""
        with open(self.users_file, 'w') as f:
            json.dump(users, f, indent=2)
    
    def _load_sessions(self) -> Dict[str, Any]:
        """Load sessions from file"""
        try:
            with open(self.sessions_file, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {}
    
    def _save_sessions(self, sessions: Dict[str, Any]):
        """Save sessions to file"""
        with open(self.sessions_file, 'w') as f:
            json.dump(sessions, f, indent=2)
    
    def register_user(self, username: str, email: str, password: str) -> Dict[str, Any]:
        """Register a new user"""
        users = self._load_users()
        
        # Check if username already exists
        if username in users:
            return {
                'success': False,
                'message': 'Username already exists'
            }
        
        # Check if email already exists
        for user_data in users.values():
            if user_data.get('email') == email:
                return {
                    'success': False,
                    'message': 'Email already registered'
                }
        
        # Validate input
        if len(username) < 3:
            return {
                'success': False,
                'message': 'Username must be at least 3 characters'
            }
        
        if len(password) < 6:
            return {
                'success': False,
                'message': 'Password must be at least 6 characters'
            }
        
        # Create new user
        user_data = {
            'username': username,
            'email': email,
            'password_hash': self._hash_password(password),
            'created_at': datetime.now().isoformat(),
            'last_login': None,
            'games_played': 0,
            'total_score': 0,
            'best_score': 0,
            'daily_scores': {},  # Format: {'YYYY-MM-DD': {'score': int, 'submitted': bool}}
            'submission_history': {},  # Detailed submission data
            'last_daily_submission': None
        }
        
        users[username] = user_data
        self._save_users(users)
        
        return {
            'success': True,
            'message': 'User registered successfully',
            'user': {
                'username': username,
                'email': email,
                'created_at': user_data['created_at']
            }
        }
    
    def login_user(self, username: str, password: str) -> Dict[str, Any]:
        """Login a user and create session"""
        users = self._load_users()
        
        if username not in users:
            return {
                'success': False,
                'message': 'Invalid username or password'
            }
        
        user_data = users[username]
        
        if not self._verify_password(password, user_data['password_hash']):
            return {
                'success': False,
                'message': 'Invalid username or password'
            }
        
        # Update last login
        user_data['last_login'] = datetime.now().isoformat()
        users[username] = user_data
        self._save_users(users)
        
        # Create session
        session_token = secrets.token_urlsafe(32)
        sessions = self._load_sessions()
        
        sessions[session_token] = {
            'username': username,
            'created_at': datetime.now().isoformat(),
            'expires_at': (datetime.now() + timedelta(days=7)).isoformat()
        }
        self._save_sessions(sessions)
        
        return {
            'success': True,
            'message': 'Login successful',
            'token': session_token,
            'user': {
                'username': username,
                'email': user_data['email'],
                'created_at': user_data['created_at'],
                'games_played': user_data['games_played'],
                'total_score': user_data['total_score'],
                'best_score': user_data['best_score']
            }
        }
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify session token and return user data"""
        sessions = self._load_sessions()
        print(f"🔍 AuthService - Token: {token[:20]}...")
        print(f"🔍 AuthService - Sessions keys: {list(sessions.keys())[:3]}...")
        
        if token not in sessions:
            print(f"🔍 AuthService - Token not found in sessions")
            return None
        
        session_data = sessions[token]
        expires_at = datetime.fromisoformat(session_data['expires_at'])
        
        if datetime.now() > expires_at:
            # Token expired, remove it
            del sessions[token]
            self._save_sessions(sessions)
            return None
        
        # Get user data
        users = self._load_users()
        username = session_data['username']
        
        if username not in users:
            # User no longer exists, remove session
            del sessions[token]
            self._save_sessions(sessions)
            return None
        
        user_data = users[username]
        return {
            'username': username,
            'email': user_data['email'],
            'created_at': user_data['created_at'],
            'games_played': user_data['games_played'],
            'total_score': user_data['total_score'],
            'best_score': user_data['best_score']
        }
    
    def logout_user(self, token: str) -> bool:
        """Logout user by removing session token"""
        sessions = self._load_sessions()
        
        if token in sessions:
            del sessions[token]
            self._save_sessions(sessions)
            return True
        
        return False
    
    def update_user_stats(self, username: str, score: int) -> bool:
        """Update user statistics after a game"""
        users = self._load_users()
        
        if username not in users:
            return False
        
        user_data = users[username]
        user_data['games_played'] += 1
        user_data['total_score'] += score
        
        if score > user_data['best_score']:
            user_data['best_score'] = score
        
        users[username] = user_data
        self._save_users(users)
        return True
    
    def get_daily_submission_status(self, username: str) -> Dict[str, Any]:
        """Check if user has already submitted today's daily challenge"""
        users = self._load_users()
        
        if username not in users:
            return {'can_submit': False, 'message': 'User not found'}
        
        user_data = users[username]
        today = datetime.now().strftime('%Y-%m-%d')
        
        # Check if user has already submitted today
        if user_data.get('last_daily_submission') == today:
            return {
                'can_submit': False, 
                'message': 'You have already submitted today\'s daily challenge',
                'daily_score': user_data.get('daily_scores', {}).get(today, {}).get('score', 0)
            }
        
        return {'can_submit': True, 'message': 'Ready to submit'}
    
    def submit_daily_score(self, username: str, score: int, submission_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """Submit daily score and update user stats with detailed submission data"""
        users = self._load_users()
        
        if username not in users:
            return {'success': False, 'message': 'User not found'}
        
        user_data = users[username]
        today = datetime.now().strftime('%Y-%m-%d')
        
        # Check if user has already submitted today
        if user_data.get('last_daily_submission') == today:
            return {
                'success': False, 
                'message': 'You have already submitted today\'s daily challenge',
                'daily_score': user_data.get('daily_scores', {}).get(today, {}).get('score', 0)
            }
        
        # Initialize data structures if they don't exist
        if 'daily_scores' not in user_data:
            user_data['daily_scores'] = {}
        if 'submission_history' not in user_data:
            user_data['submission_history'] = {}
        
        # Update daily score (simple format for backward compatibility)
        user_data['daily_scores'][today] = {
            'score': score,
            'submitted': True
        }
        
        # Store detailed submission data
        if submission_data:
            user_data['submission_history'][today] = {
                'date': today,
                'score': score,
                'mode': submission_data.get('mode', 'hard'),  # 'easy' or 'hard'
                'easy_selection': submission_data.get('easy_selection'),  # 'theme' or 'emotion' for easy mode
                'word_bank_used': submission_data.get('word_bank_used', False),
                'theme': submission_data.get('theme', ''),
                'emotion': submission_data.get('emotion', ''),
                'required_words': submission_data.get('required_words', []),
                'poem_text': submission_data.get('poem_text', ''),
                'poem_html': submission_data.get('poem_html', ''),
                'ai_guess': submission_data.get('ai_guess', {}),
                'submitted_at': datetime.now().isoformat()
            }
        
        # Update last daily submission
        user_data['last_daily_submission'] = today
        
        # Update overall stats
        user_data['games_played'] += 1
        user_data['total_score'] += score
        
        if score > user_data['best_score']:
            user_data['best_score'] = score
        
        users[username] = user_data
        self._save_users(users)
        
        return {
            'success': True, 
            'message': 'Daily score submitted successfully',
            'daily_score': score,
            'total_score': user_data['total_score'],
            'best_score': user_data['best_score']
        }
    
    def get_daily_score_history(self, username: str) -> Dict[str, Any]:
        """Get user's daily score history"""
        users = self._load_users()
        
        if username not in users:
            return {'success': False, 'message': 'User not found'}
        
        user_data = users[username]
        daily_scores = user_data.get('daily_scores', {})
        
        return {
            'success': True,
            'daily_scores': daily_scores,
            'current_streak': self._calculate_streak(daily_scores),
            'best_daily_score': max([data['score'] for data in daily_scores.values()], default=0)
        }
    
    def _calculate_streak(self, daily_scores: Dict[str, Dict]) -> int:
        """Calculate current submission streak"""
        if not daily_scores:
            return 0
        
        # Sort dates in descending order
        sorted_dates = sorted(daily_scores.keys(), reverse=True)
        streak = 0
        current_date = datetime.now()
        
        for date_str in sorted_dates:
            date_obj = datetime.strptime(date_str, '%Y-%m-%d')
            days_diff = (current_date - date_obj).days
            
            # If it's today or consecutive days, count it
            if days_diff == streak:
                streak += 1
                current_date = date_obj
            else:
                break
        
        return streak
    
    def get_submission_history(self, username: str) -> Dict[str, Any]:
        """Get user's detailed submission history"""
        users = self._load_users()
        
        if username not in users:
            return {'success': False, 'message': 'User not found'}
        
        user_data = users[username]
        submission_history = user_data.get('submission_history', {})
        
        # Sort by date (most recent first)
        sorted_submissions = dict(sorted(
            submission_history.items(), 
            key=lambda x: x[0], 
            reverse=True
        ))
        
        return {
            'success': True,
            'submissions': sorted_submissions,
            'total_submissions': len(submission_history)
        }
