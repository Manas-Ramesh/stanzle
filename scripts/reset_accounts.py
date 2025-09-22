#!/usr/bin/env python3
"""
Reset all user accounts and data
"""
import os
import json
import shutil
from datetime import datetime

def reset_all_accounts():
    """Reset all user accounts and data"""
    print("🔄 Resetting all user accounts...")
    
    # Data directory path
    data_dir = 'data'
    
    # Files to reset
    files_to_reset = [
        'users.json',
        'sessions.json',
        'challenges.json'
    ]
    
    # Create backup directory
    backup_dir = f'data_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}'
    if os.path.exists(data_dir):
        os.makedirs(backup_dir, exist_ok=True)
        print(f"📁 Created backup directory: {backup_dir}")
    
    # Backup existing data
    for file_name in files_to_reset:
        file_path = os.path.join(data_dir, file_name)
        if os.path.exists(file_path):
            backup_path = os.path.join(backup_dir, file_name)
            shutil.copy2(file_path, backup_path)
            print(f"💾 Backed up {file_name}")
    
    # Reset users.json
    users_file = os.path.join(data_dir, 'users.json')
    with open(users_file, 'w') as f:
        json.dump({}, f)
    print("✅ Reset users.json")
    
    # Reset sessions.json
    sessions_file = os.path.join(data_dir, 'sessions.json')
    with open(sessions_file, 'w') as f:
        json.dump({}, f)
    print("✅ Reset sessions.json")
    
    # Reset challenges.json
    challenges_file = os.path.join(data_dir, 'challenges.json')
    with open(challenges_file, 'w') as f:
        json.dump({}, f)
    print("✅ Reset challenges.json")
    
    # Clear any CSV exports
    csv_files = [f for f in os.listdir(data_dir) if f.endswith('.csv')]
    for csv_file in csv_files:
        os.remove(os.path.join(data_dir, csv_file))
        print(f"🗑️  Removed {csv_file}")
    
    print(f"\n🎉 All accounts reset successfully!")
    print(f"📁 Backup saved to: {backup_dir}")
    print("🔄 You can now start fresh with new accounts")

if __name__ == "__main__":
    reset_all_accounts()
