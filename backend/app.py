from flask import Flask
from flask_cors import CORS
from routes import api
from config import Config
import os

app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS for all routes (including the upload serving route)
# This is crucial for the frontend to fetch the images
CORS(app, resources={r"/*": {"origins": "*"}}) 

app.register_blueprint(api, url_prefix='/api')

# Ensure upload directory exists on startup
if not os.path.exists(Config.UPLOAD_FOLDER):
    os.makedirs(Config.UPLOAD_FOLDER)
    print(f"Created upload folder at: {Config.UPLOAD_FOLDER}")

if __name__ == '__main__':
    print("Starting Flask Backend...")
    app.run(debug=True, port=5000)