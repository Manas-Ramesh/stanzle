"""
OpenAI Service
Handles all OpenAI API interactions for poem analysis and scoring
"""

import openai
import json
from typing import Dict, Any, Optional

class OpenAIService:
    def __init__(self):
        self.client = openai.OpenAI()
    
    def analyze_poem(self, poem: str, mode: str = 'hard', focus: Optional[str] = None) -> Dict[str, Any]:
        """Analyze poem and guess theme/emotion"""
        if mode == 'easy' and focus:
            return self._analyze_single_focus(poem, focus)
        else:
            return self._analyze_both_focus(poem)
    
    def _analyze_single_focus(self, poem: str, focus: str) -> Dict[str, Any]:
        """Analyze either theme or emotion for easy mode"""
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
            {poem}
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
            {poem}
            """
        
        return self._call_openai(prompt)
    
    def _analyze_both_focus(self, poem: str) -> Dict[str, Any]:
        """Analyze both theme and emotion for hard mode"""
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
        {poem}
        """
        
        return self._call_openai(prompt)
    
    def score_poem(self, poem: str, intended_theme: str, intended_emotion: str, 
                   ai_guess: Dict[str, Any], difficulty: str = 'easy', 
                   focus: Optional[str] = None) -> Dict[str, Any]:
        """Score poem based on theme/emotion match and creativity"""
        if difficulty == 'easy' and focus:
            return self._score_single_focus(poem, intended_theme, intended_emotion, 
                                          ai_guess, focus)
        else:
            return self._score_both_focus(poem, intended_theme, intended_emotion, ai_guess)
    
    def _score_single_focus(self, poem: str, intended_theme: str, intended_emotion: str,
                           ai_guess: Dict[str, Any], focus: str) -> Dict[str, Any]:
        """Score poem for single focus (easy mode)"""
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
            {poem}
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
            {poem}
            """
        
        return self._call_openai(prompt)
    
    def _score_both_focus(self, poem: str, intended_theme: str, intended_emotion: str,
                         ai_guess: Dict[str, Any]) -> Dict[str, Any]:
        """Score poem for both theme and emotion (hard mode)"""
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
        {poem}
        """
        
        return self._call_openai(prompt)
    
    def _call_openai(self, prompt: str) -> Dict[str, Any]:
        """Make OpenAI API call"""
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an expert poetry analyst. Always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=300
            )
            
            content = response.choices[0].message.content
            print(f"OpenAI Response: {content}")  # Debug logging
            
            if not content or content.strip() == "":
                raise Exception("OpenAI returned empty response")
            
            return json.loads(content)
        except json.JSONDecodeError as e:
            print(f"JSON Decode Error: {e}")
            print(f"Raw response: {content}")
            raise Exception(f"OpenAI API error: Invalid JSON response - {str(e)}")
        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")
