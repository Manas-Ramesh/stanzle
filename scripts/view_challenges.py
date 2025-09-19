#!/usr/bin/env python3
"""
Script to view tracked daily challenges
Usage: python scripts/view_challenges.py
"""

import sys
import os
import json
from datetime import datetime

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.backend.services.challenge_tracker import ChallengeTracker

def main():
    print("📚 Stanzle Challenge Archive Viewer")
    print("=" * 50)
    
    # Initialize challenge tracker
    tracker = ChallengeTracker()
    
    # Get all challenges
    challenges = tracker.get_all_challenges()
    
    if not challenges:
        print("No challenges found in the archive.")
        return
    
    print(f"Found {len(challenges)} challenges in the archive:\n")
    
    # Sort by date
    sorted_dates = sorted(challenges.keys(), reverse=True)
    
    for date_str in sorted_dates:
        challenge = challenges[date_str]
        print(f"📅 {date_str}")
        print(f"   Theme: {challenge.get('theme', 'N/A')}")
        print(f"   Emotion: {challenge.get('emotion', 'N/A')}")
        print(f"   Words: {', '.join(challenge.get('words', []))}")
        print(f"   Submissions: {challenge.get('submissions_count', 0)}")
        print(f"   Avg Score: {challenge.get('avg_score', 0.0):.1f}")
        print(f"   Best Score: {challenge.get('best_score', 0)}")
        print()
    
    # Show file locations
    print("📁 Data Files:")
    print(f"   JSON: {tracker.challenges_file}")
    print(f"   CSV: {tracker.challenges_csv}")
    
    # Export option
    try:
        export_file = tracker.export_challenges_csv()
        print(f"   Export: {export_file}")
    except Exception as e:
        print(f"   Export failed: {e}")

if __name__ == "__main__":
    main()
