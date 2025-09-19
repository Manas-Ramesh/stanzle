#!/usr/bin/env python3
"""
Migration script to convert existing daily_scores to submission_history format
"""
import sys
import os
import json
from datetime import datetime

# Add the backend services directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '../src/backend/services'))

def migrate_user_data():
    """Migrate existing daily_scores to submission_history format"""
    print("🔄 Migrating user data to new submission_history format...")
    
    # Load users data
    users_file = 'data/users.json'
    if not os.path.exists(users_file):
        print("❌ Users file not found")
        return
    
    with open(users_file, 'r') as f:
        users = json.load(f)
    
    migrated_count = 0
    
    for username, user_data in users.items():
        if 'daily_scores' in user_data and 'submission_history' not in user_data:
            print(f"📝 Migrating user: {username}")
            
            # Initialize submission_history
            user_data['submission_history'] = {}
            
            # Convert daily_scores to submission_history
            for date, score_data in user_data['daily_scores'].items():
                if score_data.get('submitted', False):
                    # Create basic submission history entry
                    user_data['submission_history'][date] = {
                        'date': date,
                        'score': score_data['score'],
                        'mode': 'hard',  # Default to hard mode for legacy data
                        'easy_selection': None,
                        'word_bank_used': False,  # Default to false for legacy data
                        'theme': 'Unknown',  # We don't have this data for legacy submissions
                        'emotion': 'Unknown',
                        'required_words': [],
                        'poem_text': 'Legacy submission - poem text not available',
                        'poem_html': '',
                        'ai_guess': {},
                        'submitted_at': f"{date}T00:00:00"  # Default time
                    }
                    migrated_count += 1
            
            print(f"   ✅ Migrated {len(user_data['daily_scores'])} submissions")
    
    # Save updated users data
    with open(users_file, 'w') as f:
        json.dump(users, f, indent=2)
    
    print(f"🎉 Migration complete! Migrated {migrated_count} submissions across {len(users)} users")

if __name__ == "__main__":
    migrate_user_data()
