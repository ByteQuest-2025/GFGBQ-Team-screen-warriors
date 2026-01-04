from flask import Blueprint, request, jsonify, send_from_directory
from ai_classifier import AIClassifier
from config import Config
import os
import time
from werkzeug.utils import secure_filename

api = Blueprint('api', __name__)
classifier = AIClassifier(Config.GEMINI_API_KEY)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp3', 'wav', 'ogg', 'webm', 'm4a'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@api.route('/uploads/<filename>')
def serve_file(filename):
    return send_from_directory(Config.UPLOAD_FOLDER, filename)

@api.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Backend is running'}), 200

@api.route('/classify-complaint', methods=['POST'])
def classify_complaint():
    try:
        data = request.get_json()
        complaint_text = data.get('text', '')
        
        if not complaint_text:
            return jsonify({'error': 'Complaint text is required'}), 400
        
        result = classifier.classify_complaint(complaint_text)
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/analyze-image', methods=['POST'])
def analyze_image():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        additional_text = request.form.get('text', '')
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            original_filename = secure_filename(file.filename)
            unique_filename = f"{int(time.time())}_{original_filename}"
            filepath = os.path.join(Config.UPLOAD_FOLDER, unique_filename)
            
            os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
            
            file.save(filepath)
            
            file_url = f"http://localhost:5000/api/uploads/{unique_filename}"
            
            result = classifier.analyze_image_complaint(filepath, additional_text)
            
            result['media_url'] = file_url
            result['media_filename'] = unique_filename
            
            return jsonify(result), 200
        
        return jsonify({'error': 'Invalid file type'}), 400
    
    except Exception as e:
        print(f"Image Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@api.route('/analyze-audio', methods=['POST'])
def analyze_audio():
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        file = request.files['audio']
        additional_text = request.form.get('text', '')
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            original_filename = secure_filename(file.filename)
            unique_filename = f"{int(time.time())}_{original_filename}"
            filepath = os.path.join(Config.UPLOAD_FOLDER, unique_filename)
            
            os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
            
            file.save(filepath)
            
            file_url = f"http://localhost:5000/api/uploads/{unique_filename}"
            
            try:
                result = classifier.analyze_audio_complaint(filepath, additional_text)
            except AttributeError:
                result = {
                    "transcription": "Audio received",
                    "description": "Voice note attached",
                    "category": "Other",
                    "urgency": 1,
                    "summary": additional_text or "Voice Complaint"
                }

            result['media_url'] = file_url
            result['media_filename'] = unique_filename
            
            return jsonify(result), 200
        
        return jsonify({'error': 'Invalid file type'}), 400
    
    except Exception as e:
        print(f"Audio Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@api.route('/get-authority-by-category', methods=['POST'])
def get_authority_by_category():
    try:
        data = request.get_json()
        category = data.get('category', '')
        region = data.get('region', '')
        authorities = data.get('authorities', [])
        
        matched_auth = None

        if region:
            for auth in authorities:
                auth_role = auth.get('role', '').lower()
                auth_region = auth.get('jurisdiction', '').lower()
                if auth_role == category.lower() and region.lower() in auth_region:
                    matched_auth = auth
                    break
        
        if not matched_auth:
            for auth in authorities:
                if auth.get('role', '').lower() == category.lower():
                    matched_auth = auth
                    break

        if not matched_auth and authorities:
            matched_auth = authorities[0]
        
        if matched_auth:
            return jsonify({
                'authority': matched_auth['walletAddress'],
                'authorityInfo': matched_auth
            }), 200
        
        return jsonify({'error': 'No authority found'}), 404
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500