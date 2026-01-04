from google import genai
from google.genai import types
import json
import os

class AIClassifier:
    def __init__(self, api_key):
        self.client = genai.Client(api_key=api_key)
        # Use the model you confirmed you have access to
        self.model_name = 'gemini-2.5-flash'
    
    def classify_complaint(self, complaint_text):
        prompt = f"""
Analyze the following citizen complaint and provide:
1. Category (one of: Municipal, Police, Health, Electricity, Water, Education, Transport, Other)
2. Urgency Level (0=Low, 1=Medium, 2=High, 3=Critical)
3. Brief Summary (max 100 words)

Complaint: {complaint_text}

Respond ONLY with valid JSON in this exact format:
{{"category": "Municipal", "urgency": 2, "summary": "Brief summary here"}}
"""
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            return json.loads(response.text.strip())
        except Exception as e:
            print(f"AI Classification Error: {str(e)}")
            return self._fallback_classification(complaint_text)
    
    def analyze_image_complaint(self, image_path, additional_text=""):
        prompt = f"""
Analyze this image of a citizen complaint/grievance and provide:
1. What is the issue shown? (detailed description)
2. Category (Municipal, Police, Health, Electricity, Water, Education, Transport, Other)
3. Urgency Level (0=Low, 1=Medium, 2=High, 3=Critical)
4. Brief Summary

Additional context: {additional_text}

Respond ONLY with valid JSON in this format:
{{"description": "what you see", "category": "Municipal", "urgency": 2, "summary": "Brief summary"}}
"""
        try:
            print(f"Uploading image: {image_path}...")
            
            # --- THE FIX IS HERE ---
            # Changed 'path=' to 'file='
            uploaded_file = self.client.files.upload(file=image_path)
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[uploaded_file, prompt],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            
            return json.loads(response.text.strip())
        except Exception as e:
            print(f"Image Analysis Error: {str(e)}")
            return {
                'description': additional_text or 'Image analysis unavailable',
                'category': 'Other',
                'urgency': 1,
                'summary': additional_text[:100] or 'Image-based complaint'
            }

    def analyze_audio_complaint(self, audio_path, additional_text=""):
        prompt = f"""
Listen to this citizen complaint audio and provide:
1. Transcription/Summary of the issue
2. Category (Municipal, Police, Health, Electricity, Water, Education, Transport, Other)
3. Urgency Level (0=Low, 1=Medium, 2=High, 3=Critical)

Additional context: {additional_text}

Respond ONLY with valid JSON in this format:
{{"transcription": "summary of audio", "category": "Municipal", "urgency": 2, "summary": "Brief summary"}}
"""
        try:
            print(f"Uploading audio: {audio_path}...")
            
            # --- THE FIX IS HERE ALSO ---
            uploaded_file = self.client.files.upload(file=audio_path)
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[uploaded_file, prompt],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            return json.loads(response.text.strip())
        except Exception as e:
            print(f"Audio Analysis Error: {str(e)}")
            return {
                'transcription': 'Audio analysis unavailable',
                'category': 'Other',
                'urgency': 1,
                'summary': additional_text or 'Audio complaint'
            }

    def _fallback_classification(self, text):
        """Fallback keyword-based classification when AI fails"""
        text_lower = text.lower()
        if any(w in text_lower for w in ['road', 'pothole', 'garbage', 'drain', 'light']):
            return {'category': 'Municipal', 'urgency': 1, 'summary': text[:100]}
        elif any(w in text_lower for w in ['theft', 'crime', 'assault', 'robbery']):
            return {'category': 'Police', 'urgency': 2, 'summary': text[:100]}
        elif any(w in text_lower for w in ['health', 'hospital', 'doctor', 'ambulance']):
            return {'category': 'Health', 'urgency': 2, 'summary': text[:100]}
        elif any(w in text_lower for w in ['electricity', 'power', 'wire', 'shock']):
            return {'category': 'Electricity', 'urgency': 1, 'summary': text[:100]}
        elif any(w in text_lower for w in ['water', 'pipe', 'leak', 'supply']):
            return {'category': 'Water', 'urgency': 1, 'summary': text[:100]}
        elif any(w in text_lower for w in ['school', 'education', 'teacher', 'college']):
            return {'category': 'Education', 'urgency': 0, 'summary': text[:100]}
        elif any(w in text_lower for w in ['bus', 'transport', 'traffic', 'signal']):
            return {'category': 'Transport', 'urgency': 1, 'summary': text[:100]}
        else:
            return {'category': 'Other', 'urgency': 1, 'summary': text[:100]}