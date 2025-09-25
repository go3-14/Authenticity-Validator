import re
import json
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import easyocr
import cv2
from pyzbar.pyzbar import decode
from rapidfuzz import fuzz
import fitz  # PyMuPDF
from PIL import Image

# --- Flask App Initialization ---
app = Flask(__name__)
CORS(app) # Enable Cross-Origin Resource Sharing

# --- Configuration and Setup ---
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# --- Load Database and OCR Model ---
try:
    with open("database.json", "r") as f:
        records = json.load(f)
    print("Database 'database.json' loaded successfully.")
except FileNotFoundError:
    records = []
    print("Warning: 'database.json' not found. Running with empty DB.")

print("Loading EasyOCR model into memory...")
reader = easyocr.Reader(['en'], gpu=False)
print("EasyOCR model loaded.")

# --- File to Image Conversion ---
def file_to_image(file_path, dpi=150):
    """Converts the first page of a PDF or an image file to a numpy array."""
    file_extension = os.path.splitext(file_path)[1].lower()
    
    if file_extension == '.pdf':
        doc = fitz.open(file_path)
        page = doc.load_page(0)
        pix = page.get_pixmap(dpi=dpi)
        img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, 3)
        return img
    elif file_extension in ['.jpg', '.jpeg', '.png']:
        img = Image.open(file_path)
        if img.mode != 'RGB':
            img = img.convert('RGB')
        return np.array(img)
    else:
        raise ValueError(f"Unsupported file type: {file_extension}")

# --- Helpers ---
def extract_qr_roll(np_img):
    """Extract roll number from QR code if present"""
    qr_codes = decode(cv2.cvtColor(np_img, cv2.COLOR_RGB2BGR))
    if qr_codes:
        return qr_codes[0].data.decode("utf-8").strip()
    return None

# --- Core Verification Logic ---
def verify_certificate(pdf_path):
    try:
        # 1. Convert file to image and pre-process for speed
        np_img = file_to_image(pdf_path)
        gray_img = cv2.cvtColor(np_img, cv2.COLOR_RGB2GRAY)
        _, processed_img = cv2.threshold(gray_img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        # 2. Try QR Code first
        roll = extract_qr_roll(np_img)
        print("DEBUG: QR Roll Number Detected:", roll)

        # 3. OCR extraction
        results = reader.readtext(processed_img)
        text = " ".join([r[1] for r in results])
        print("DEBUG: OCR Extracted Text:", text)

        # 4. Fallback: regex roll no from OCR text
        if not roll:
            roll_match = re.search(r"(R[0-9O]{4}[A-Z]{2}[0-9O]{3}|[0-9]{7})", text, re.IGNORECASE)
            if roll_match:
                roll = roll_match.group(0).upper().replace('O', '0')
            else:
                roll = None
        
        if not roll:
            return {
                "filename": os.path.basename(pdf_path),
                "rollno_found": None,
                "is_verified": False,
                "error": "Could not find a valid Roll Number in the document."
            }

        # --- Helpers for normalization ---
        def normalize_roll(r):
            if not r: return ""
            return r.strip().upper().replace("O", "0").replace(" ", "")
        
        def normalize_text(s: str) -> str:
            s = str(s).lower().replace(" ", "")
            s = s.replace(",", "").replace(".", "")
            return s

        # 5. Lookup in DB
        matched_record = None
        normalized_roll_found = normalize_roll(roll)
        for record in records:
            if normalize_roll(record.get("rollno")) == normalized_roll_found:
                matched_record = record
                break

        if not matched_record:
            return {
                "filename": os.path.basename(pdf_path),
                "rollno_found": roll,
                "is_verified": False,
                "error": "Roll Number was found, but it does not match any record in the database."
            }

        # 6. Cross-verify fields with OCR text
        mismatches = []
        normalized_ocr_text = normalize_text(text)
        for field in ["name", "cgpa", "branch", "college"]:
             db_value = str(matched_record.get(field, ""))
             if normalize_text(db_value) not in normalized_ocr_text:
                mismatches.append(field)

        # 7. Return verification result
        return {
            "filename": os.path.basename(pdf_path),
            "rollno_found": roll,
            "is_verified": len(mismatches) == 0,
            "database_record": matched_record,
            "mismatched_fields": mismatches
        }

    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}

# --- API Endpoints ---
@app.route('/api/verify', methods=['POST'])
def handle_verify_request():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
        
    if file:
        filename = file.filename
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        try:
            file.save(filepath)
            verification_result = verify_certificate(filepath)
            return jsonify(verification_result)
        finally:
            if os.path.exists(filepath):
                os.remove(filepath)
    else:
        return jsonify({"error": "Invalid file type."}), 400

# --- Run the Application ---
if __name__ == '__main__':
    app.run(port=5000, debug=True)

