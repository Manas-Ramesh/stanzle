"""
Validation utilities for the Stanzle application
"""

from typing import Dict, Any

def validate_poem_data(data: Dict[str, Any]) -> bool:
    """Validate poem data structure"""
    print(f"Validating poem data: {data}")
    if not isinstance(data, dict):
        print("Data is not a dict")
        return False
    
    # Check required fields
    required_fields = ['poem']
    for field in required_fields:
        if field not in data:
            return False
    
    # Validate poem content
    poem = data.get('poem', '')
    if not isinstance(poem, str) or len(poem.strip()) == 0:
        return False
    
    # Validate optional fields
    if 'mode' in data and data['mode'] not in ['easy', 'hard']:
        print(f"Invalid mode: {data['mode']}")
        return False
    
    if 'focus' in data and data['focus'] not in ['theme', 'emotion']:
        print(f"Invalid focus: {data['focus']}")
        return False
    
    if 'difficulty' in data and data['difficulty'] not in ['easy', 'hard']:
        print(f"Invalid difficulty: {data['difficulty']}")
        return False
    
    return True

def validate_challenge_data(data: Dict[str, Any]) -> bool:
    """Validate challenge data structure"""
    if not isinstance(data, dict):
        return False
    
    required_fields = ['words', 'theme', 'emotion']
    for field in required_fields:
        if field not in data:
            return False
    
    # Validate words list
    words = data.get('words', [])
    if not isinstance(words, list) or len(words) == 0:
        return False
    
    # Validate theme and emotion
    theme = data.get('theme', '')
    emotion = data.get('emotion', '')
    
    if not isinstance(theme, str) or len(theme.strip()) == 0:
        return False
    
    if not isinstance(emotion, str) or len(emotion.strip()) == 0:
        return False
    
    return True

def sanitize_text(text: str) -> str:
    """Sanitize text input"""
    if not isinstance(text, str):
        return ""
    
    # Remove potentially dangerous HTML tags
    import re
    dangerous_tags = re.compile(r'<(script|iframe|object|embed|form)[^>]*>.*?</\1>', re.IGNORECASE | re.DOTALL)
    text = dangerous_tags.sub('', text)
    
    # Limit length
    if len(text) > 10000:  # 10k character limit
        text = text[:10000]
    
    return text.strip()
