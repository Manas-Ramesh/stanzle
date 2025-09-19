"""
Challenge Tracker Service
Tracks daily challenges for future archive mode functionality
"""

import json
import csv
import os
from datetime import datetime, date
from typing import Dict, List, Any

class ChallengeTracker:
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.challenges_file = os.path.join(data_dir, "daily_challenges.json")
        self.challenges_csv = os.path.join(data_dir, "daily_challenges.csv")
        
        # Create data directory if it doesn't exist
        os.makedirs(data_dir, exist_ok=True)
        
        # Initialize files if they don't exist
        self._init_files()
    
    def _init_files(self):
        """Initialize tracking files if they don't exist"""
        # Initialize JSON file
        if not os.path.exists(self.challenges_file):
            with open(self.challenges_file, 'w') as f:
                json.dump({}, f)
        
        # Initialize CSV file with headers
        if not os.path.exists(self.challenges_csv):
            with open(self.challenges_csv, 'w', newline='') as f:
                writer = csv.writer(f)
                writer.writerow([
                    'date', 'theme', 'emotion', 'word1', 'word2', 'word3', 'word4',
                    'submissions_count', 'avg_score', 'best_score', 'created_at'
                ])
    
    def track_challenge(self, challenge_data: Dict[str, Any], submissions_count: int = 0, 
                       avg_score: float = 0.0, best_score: int = 0) -> bool:
        """Track a daily challenge"""
        try:
            # Get current date
            today = date.today().isoformat()
            
            # Load existing challenges
            challenges = self._load_challenges()
            
            # Create challenge record
            challenge_record = {
                'date': today,
                'theme': challenge_data.get('theme', ''),
                'emotion': challenge_data.get('emotion', ''),
                'words': challenge_data.get('words', []),
                'submissions_count': submissions_count,
                'avg_score': avg_score,
                'best_score': best_score,
                'created_at': datetime.now().isoformat()
            }
            
            # Store in JSON format
            challenges[today] = challenge_record
            self._save_challenges(challenges)
            
            # Append to CSV
            self._append_to_csv(challenge_record)
            
            return True
            
        except Exception as e:
            print(f"Error tracking challenge: {e}")
            return False
    
    def get_challenge_by_date(self, target_date: str) -> Dict[str, Any]:
        """Get challenge by specific date"""
        challenges = self._load_challenges()
        return challenges.get(target_date, {})
    
    def get_all_challenges(self) -> Dict[str, Any]:
        """Get all tracked challenges"""
        return self._load_challenges()
    
    def get_challenges_by_month(self, year: int, month: int) -> Dict[str, Any]:
        """Get challenges for a specific month"""
        challenges = self._load_challenges()
        month_challenges = {}
        
        for date_str, challenge in challenges.items():
            challenge_date = datetime.fromisoformat(date_str).date()
            if challenge_date.year == year and challenge_date.month == month:
                month_challenges[date_str] = challenge
        
        return month_challenges
    
    def update_challenge_stats(self, target_date: str, submissions_count: int = None, 
                              avg_score: float = None, best_score: int = None) -> bool:
        """Update statistics for a specific challenge"""
        try:
            challenges = self._load_challenges()
            
            if target_date not in challenges:
                return False
            
            challenge = challenges[target_date]
            
            if submissions_count is not None:
                challenge['submissions_count'] = submissions_count
            if avg_score is not None:
                challenge['avg_score'] = avg_score
            if best_score is not None:
                challenge['best_score'] = best_score
            
            challenges[target_date] = challenge
            self._save_challenges(challenges)
            
            return True
            
        except Exception as e:
            print(f"Error updating challenge stats: {e}")
            return False
    
    def _load_challenges(self) -> Dict[str, Any]:
        """Load challenges from JSON file"""
        try:
            with open(self.challenges_file, 'r') as f:
                return json.load(f)
        except Exception:
            return {}
    
    def _save_challenges(self, challenges: Dict[str, Any]):
        """Save challenges to JSON file"""
        with open(self.challenges_file, 'w') as f:
            json.dump(challenges, f, indent=2)
    
    def _append_to_csv(self, challenge_record: Dict[str, Any]):
        """Append challenge record to CSV file"""
        try:
            with open(self.challenges_csv, 'a', newline='') as f:
                writer = csv.writer(f)
                words = challenge_record.get('words', [])
                writer.writerow([
                    challenge_record['date'],
                    challenge_record['theme'],
                    challenge_record['emotion'],
                    words[0] if len(words) > 0 else '',
                    words[1] if len(words) > 1 else '',
                    words[2] if len(words) > 2 else '',
                    words[3] if len(words) > 3 else '',
                    challenge_record['submissions_count'],
                    challenge_record['avg_score'],
                    challenge_record['best_score'],
                    challenge_record['created_at']
                ])
        except Exception as e:
            print(f"Error appending to CSV: {e}")
    
    def export_challenges_csv(self, output_file: str = None) -> str:
        """Export all challenges to a new CSV file"""
        if output_file is None:
            output_file = os.path.join(self.data_dir, f"challenges_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv")
        
        challenges = self._load_challenges()
        
        with open(output_file, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow([
                'date', 'theme', 'emotion', 'word1', 'word2', 'word3', 'word4',
                'submissions_count', 'avg_score', 'best_score', 'created_at'
            ])
            
            for date_str, challenge in challenges.items():
                words = challenge.get('words', [])
                writer.writerow([
                    challenge['date'],
                    challenge['theme'],
                    challenge['emotion'],
                    words[0] if len(words) > 0 else '',
                    words[1] if len(words) > 1 else '',
                    words[2] if len(words) > 2 else '',
                    words[3] if len(words) > 3 else '',
                    challenge['submissions_count'],
                    challenge['avg_score'],
                    challenge['best_score'],
                    challenge['created_at']
                ])
        
        return output_file
