from google import genai
import json

class AIClassifier:
    def __init__(self, api_key):
        self.client = genai.Client(api_key=api_key)
    
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
                model="gemini-2.0-flash-exp",
                contents=prompt
            )
            
            result_text = response.text.strip()
            
            if result_text.startswith('```json'):
                result_text = result_text[7:]
            if result_text.endswith('```'):
                result_text = result_text[:-3]
            result_text = result_text.strip()
            
            result = json.loads(result_text)
            
            return {
                'category': result.get('category', 'Other'),
                'urgency': result.get('urgency', 1),
                'summary': result.get('summary', complaint_text[:100])
            }
        except Exception as e:
            print(f"AI Classification Error: {str(e)}")
            return {
                'category': 'Other',
                'urgency': 1,
                'summary': complaint_text[:100]
            }
    
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
            with open(image_path, 'rb') as f:
                image_data = f.read()
            
            response = self.client.models.generate_content(
                model="gemini-2.0-flash-exp",
                contents=[
                    {"mime_type": "image/jpeg", "data": image_data},
                    prompt
                ]
            )
            
            result_text = response.text.strip()
            
            if result_text.startswith('```json'):
                result_text = result_text[7:]
            if result_text.endswith('```'):
                result_text = result_text[:-3]
            result_text = result_text.strip()
            
            result = json.loads(result_text)
            
            return {
                'description': result.get('description', 'Image analysis unavailable'),
                'category': result.get('category', 'Other'),
                'urgency': result.get('urgency', 1),
                'summary': result.get('summary', 'Image-based complaint')
            }
        except Exception as e:
            print(f"Image Analysis Error: {str(e)}")
            return {
                'description': additional_text,
                'category': 'Other',
                'urgency': 1,
                'summary': additional_text[:100] if additional_text else 'Image-based complaint'
            }