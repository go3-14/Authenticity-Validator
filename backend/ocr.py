import re
import json
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pdf2image import convert_from_path
import numpy as np
import easyocr

# --- Flask App Initialization ---
app = Flask(__name__)
CORS(app) # Enable Cross-Origin Resource Sharing

# --- Configuration and Setup ---
# Create a folder to temporarily store uploaded PDFs
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# --- Load Database and OCR Model (once at startup for efficiency) ---
try:
    with open("database.json", "r") as f:
        records = json.load(f)
    print("Database 'database.json' loaded successfully.")
except FileNotFoundError:
    records = []
    print("Warning: 'database.json' not found. The application will run with an empty database.")

# Initialize the EasyOCR reader. This might take a moment.
print("Loading EasyOCR model into memory...")
reader = easyocr.Reader(['en'], gpu=False)
print("EasyOCR model loaded.")


# --- Core Verification Logic ---
def verify_certificate(pdf_path):
    """
    Processes a PDF file to extract text, find a roll number, and verify it against the database.
    
    Args:
        pdf_path (str): The file path to the PDF certificate.

    Returns:
        dict: A dictionary containing verification results.
    """
    try:
        # 1. Convert the first page of the PDF to an image
        pages = convert_from_path(pdf_path, dpi=300)
        if not pages:
            return {"error": "Could not convert PDF to image. It might be empty or corrupted."}
        img = pages[0]

        # 2. Perform OCR on the image to extract text
        np_img = np.array(img)
        results = reader.readtext(np_img)
        text = " ".join([r[1] for r in results])

        # 3. Parse the text to find a roll number using regex
        # This pattern looks for a format like R1234AB567
        # NEW, MORE ROBUST CODE
        # This pattern allows 'O' where a '0' might be. re.IGNORECASE handles if 'r' is lowercase.
        roll_match = re.search(r"R[0-9O]{4}[A-Z]{2}[0-9O]{3}", text, re.IGNORECASE)

        if roll_match:
            # Normalize the result: convert to uppercase and replace all 'O's with '0's
            roll = roll_match.group(0).upper().replace('O', '0')
        else:
            roll = None

        # 4. Check the extracted roll number against the loaded database records
        matched_record = None
        for record in records:
            if roll and record.get("rollno", "").strip() == roll.strip():
                matched_record = record
                break # Stop searching once a match is found

        return {
            "filename": os.path.basename(pdf_path),
            "full_text_from_pdf": text,
            "rollno_found_in_pdf": roll,
            "is_verified": bool(matched_record),
            "database_record": matched_record
        }
    except Exception as e:
        # Return any exceptions as an error message
        return {"error": f"An unexpected error occurred: {str(e)}"}


# --- API Endpoints ---
@app.route('/')
def index():
    """A simple root endpoint to confirm the API is running."""
    return "<h1>Certificate Verification API</h1><p>Send a POST request with a PDF file to /api/verify</p>"

@app.route('/api/verify', methods=['POST'])
def handle_verify_request():
    """
    Handles the file upload and verification process.
    """
    # Check if a file was included in the request
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files['file']
    
    # Check if a file was actually selected
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
        
    # Check if the file is a PDF
    if file and file.filename.endswith('.pdf'):
        filename = file.filename
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        try:
            # Save the file, process it, and then clean up
            file.save(filepath)
            verification_result = verify_certificate(filepath)
            return jsonify(verification_result)
        finally:
            # Ensure the uploaded file is deleted after processing
            if os.path.exists(filepath):
                os.remove(filepath)
    else:
        return jsonify({"error": "Invalid file type. Please upload a PDF file."}), 400

# --- Run the Application ---
if __name__ == '__main__':
    # Runs the Flask app on port 5000 in debug mode
    app.run(port=5000, debug=True)
