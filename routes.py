from flask import Blueprint, request, jsonify
from ai_classifier import AIClassifier
from config import Config
import os
from werkzeug.utils import secure_filename

api = Blueprint('api', __name__)
classifier = AIClassifier(Config.GEMINI_API_KEY)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp3', 'wav', 'ogg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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
            filename = secure_filename(file.filename)
            filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
            
            os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
            file.save(filepath)
            
            result = classifier.analyze_image_complaint(filepath, additional_text)
            
            return jsonify(result), 200
        
        return jsonify({'error': 'Invalid file type'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/get-authority-by-category', methods=['POST'])
def get_authority_by_category():
    try:
        data = request.get_json()
        category = data.get('category', '')
        authorities = data.get('authorities', [])
        
        for authority in authorities:
            if authority.get('role', '').lower() == category.lower():
                return jsonify({'authority': authority['walletAddress']}), 200
        
        if authorities:
            return jsonify({'authority': authorities[0]['walletAddress']}), 200
        
        return jsonify({'error': 'No authority found'}), 404
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
