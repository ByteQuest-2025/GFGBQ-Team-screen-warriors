from flask import Flask
from flask_cors import CORS
from routes import api
from config import Config
import os

app = Flask(__name__)
app.config.from_object(Config)

CORS(app, resources={r"/api/*": {"origins": "*"}})

app.register_blueprint(api, url_prefix='/api')

os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)

if __name__ == '__main__':
    app.run(debug=True, port=5000)