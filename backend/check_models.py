import google.generativeai as genai
import os

# Replace with your actual key
os.environ["GEMINI_API_KEY"] = "AIzaSyA2aFY2lgGmlkVDoEPypoue4XnMHC3ViM0"
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

print("--- CHECKING AVAILABLE MODELS ---")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"Found: {m.name}")
except Exception as e:
    print(f"Error listing models: {e}")