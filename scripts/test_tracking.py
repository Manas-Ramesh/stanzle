#!/usr/bin/env python3
"""
Test script to manually add a challenge and verify tracking works
"""

import sys
import os
from datetime import datetime

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.backend.services.challenge_tracker import ChallengeTracker

def main():
    print("🧪 Testing Challenge Tracking System")
    print("=" * 50)
    
    # Initialize challenge tracker
    tracker = ChallengeTracker()
    
    # Create a test challenge
    test_challenge = {
        'theme': 'Adventure',
        'emotion': 'Joy',
        'words': ['mountain', 'journey', 'discover', 'freedom']
    }
    
    print("📝 Adding test challenge...")
    success = tracker.track_challenge(test_challenge, submissions_count=5, avg_score=75.2, best_score=95)
    
    if success:
        print("✅ Test challenge added successfully!")
        
        # Verify it was stored
        challenges = tracker.get_all_challenges()
        print(f"📊 Total challenges in archive: {len(challenges)}")
        
        # Show the challenge
        for date, challenge in challenges.items():
            print(f"\n📅 {date}")
            print(f"   Theme: {challenge.get('theme')}")
            print(f"   Emotion: {challenge.get('emotion')}")
            print(f"   Words: {', '.join(challenge.get('words', []))}")
            print(f"   Submissions: {challenge.get('submissions_count')}")
            print(f"   Avg Score: {challenge.get('avg_score')}")
            print(f"   Best Score: {challenge.get('best_score')}")
    else:
        print("❌ Failed to add test challenge")
    
    print("\n🔍 Testing API endpoints...")
    print("You can now test:")
    print("  curl http://localhost:8000/api/archive/challenges")
    print("  python scripts/view_challenges.py")

if __name__ == "__main__":
    main()
