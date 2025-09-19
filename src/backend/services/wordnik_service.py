"""
Wordnik Service
Handles Wordnik API integration for random words, themes, and emotions
"""

import requests
import random
import os
from typing import List, Dict, Any

class WordnikService:
    def __init__(self):
        self.api_key = os.getenv('WORDNIK_API_KEY')
        self.base_url = "http://api.wordnik.com/v4"
        
        # Word categories for filtering
        self.poetic_parts_of_speech = ['noun', 'verb', 'adjective']
        self.technical_words_to_avoid = [
            'algorithm', 'database', 'software', 'hardware', 'computer', 'technology',
            'programming', 'code', 'function', 'variable', 'parameter', 'interface',
            'system', 'network', 'protocol', 'framework', 'library', 'module',
            'configuration', 'implementation', 'optimization', 'debugging'
        ]
        
        # Theme and emotion word lists
        self.theme_words = [
            'adventure', 'love', 'nature', 'dreams', 'time', 'hope', 'loss', 'freedom',
            'journey', 'discovery', 'mystery', 'beauty', 'wisdom', 'courage', 'peace',
            'harmony', 'balance', 'transformation', 'growth', 'change', 'renewal'
        ]
        
        self.emotion_words = [
            'joy', 'sadness', 'anger', 'fear', 'surprise', 'peace', 'excitement',
            'nostalgia', 'wonder', 'melancholy', 'euphoria', 'serenity', 'longing',
            'contentment', 'anxiety', 'bliss', 'despair', 'hope', 'gratitude'
        ]

    def get_random_words(self, count: int = 4) -> List[str]:
        """Get random words from Wordnik API with filtering"""
        if not self.api_key:
            print("Warning: WORDNIK_API_KEY not set, using fallback words")
            return self.get_fallback_words()
        
        try:
            # Wordnik API endpoint for random words
            url = f"{self.base_url}/words.json/randomWords"
            params = {
                'hasDictionaryDef': 'true',
                'includePartOfSpeech': ','.join(self.poetic_parts_of_speech),
                'minCorpusCount': '1000',  # Filter out rare words
                'maxCorpusCount': '-1',
                'minDictionaryCount': '3',  # Word appears in multiple dictionaries
                'maxDictionaryCount': '-1',
                'minLength': '3',
                'maxLength': '10',
                'limit': str(count * 2),  # Get extra to filter
                'api_key': self.api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            words_data = response.json()
            words = [word['word'].lower() for word in words_data]
            
            # Filter out technical words and duplicates
            filtered_words = []
            for word in words:
                if (word not in self.technical_words_to_avoid and 
                    word not in filtered_words and 
                    len(word) >= 3 and 
                    word.isalpha()):
                    filtered_words.append(word)
            
            # Return the requested number of words
            return filtered_words[:count] if len(filtered_words) >= count else self.get_fallback_words()[:count]
            
        except Exception as e:
            print(f"Error fetching words from Wordnik: {e}")
            return self.get_fallback_words()[:count]

    def get_fallback_words(self) -> List[str]:
        """Fallback word lists when API is unavailable"""
        fallback_words = [
            ['mountain', 'journey', 'discover', 'freedom'],
            ['heart', 'soul', 'passion', 'forever'],
            ['tree', 'wind', 'ocean', 'sky'],
            ['sleep', 'dream', 'reality', 'awake'],
            ['clock', 'moment', 'eternity', 'now'],
            ['light', 'dark', 'shine', 'bright'],
            ['tear', 'smile', 'memory', 'goodbye'],
            ['bird', 'cage', 'fly', 'free'],
            ['river', 'stone', 'whisper', 'dance'],
            ['shadow', 'light', 'breath', 'song']
        ]
        return random.choice(fallback_words)

    def get_random_theme(self) -> str:
        """Get a random theme"""
        return random.choice(self.theme_words).title()

    def get_random_emotion(self) -> str:
        """Get a random emotion"""
        return random.choice(self.emotion_words).title()

    def get_word_definitions(self, words: List[str]) -> Dict[str, str]:
        """Get definitions for words (optional feature)"""
        if not self.api_key:
            return {}
        
        definitions = {}
        for word in words:
            try:
                url = f"{self.base_url}/word.json/{word}/definitions"
                params = {
                    'limit': 1,
                    'api_key': self.api_key
                }
                
                response = requests.get(url, params=params, timeout=5)
                if response.status_code == 200:
                    data = response.json()
                    if data:
                        definitions[word] = data[0].get('text', '')
                        
            except Exception as e:
                print(f"Error getting definition for {word}: {e}")
                continue
        
        return definitions

    def generate_daily_challenge(self) -> Dict[str, Any]:
        """Generate a complete daily challenge with words, theme, and emotion"""
        words = self.get_random_words(4)
        theme = self.get_random_theme()
        emotion = self.get_random_emotion()
        
        return {
            'words': words,
            'theme': theme,
            'emotion': emotion
        }
