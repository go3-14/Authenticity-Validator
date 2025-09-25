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

# --- PDF to Image (using PyMuPDF) ---
def pdf_to_image(pdf_path, dpi=300):
    """Convert first page of PDF to numpy image"""
    doc = fitz.open(pdf_path)
    page = doc.load_page(0)  # first page only
    pix = page.get_pixmap(dpi=dpi)
    img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, 3)
    return img

# --- Helpers ---
def extract_qr_roll(np_img):
    """Extract roll number from QR code if present"""
    qr_codes = decode(cv2.cvtColor(np_img, cv2.COLOR_RGB2BGR))
    if qr_codes:
        return qr_codes[0].data.decode("utf-8").strip()
    return None

def is_fuzzy_match(a, b, threshold=70):
    """Check fuzzy match to tolerate OCR noise"""
    return fuzz.ratio(a.lower(), b.lower()) >= threshold

# --- Core Verification Logic ---
# --- Core Verification Logic (Certificate ID based) ---
def verify_certificate(pdf_path):
    try:
        # 1. Convert first page of PDF to image
        np_img = pdf_to_image(pdf_path)

        # 2. OCR extraction
        results = reader.readtext(np_img)
        text = " ".join([r[1] for r in results])
        print("DEBUG: OCR Extracted Text:", text)

        # --- Helpers ---
        def normalize_text(s: str) -> str:
            s = str(s).lower()
            s = s.replace("O", "0").replace("I", "1")
            s = s.replace(",", "").replace(".", "").replace(" ", "")
            return s

        # 3. Extract certificate ID via regex
        # Example regex: C12345, CERT2025001, etc. Adjust to your format
        cert_match = re.search(r"(C[0-9]{5,}|CERT[0-9]{6,})", text, re.IGNORECASE)
        cert_id = cert_match.group(0).upper() if cert_match else None

        # 4. Lookup in DB
        matched_record = None
        for record in records:
            if str(record.get("certificate_id", "")).upper() == cert_id:
                matched_record = record
                break

        if not matched_record:
            return {
                "filename": os.path.basename(pdf_path),
                "certificate_id_found": cert_id,
                "is_verified": False,
                "error": "No matching record found in database."
            }

        # 5. Cross-verify other fields with OCR text
        mismatches = []
        for field in ["name", "cgpa", "branch", "college"]:
            if normalize_text(matched_record.get(field, "")) not in normalize_text(text):
                mismatches.append(field)
                print("mismatch")

        # 6. Return verification result
        return {
            "filename": os.path.basename(pdf_path),
            "certificate_id_found": cert_id,
            "is_verified": len(mismatches) == 0,
            "database_record": matched_record,
            "mismatched_fields": mismatches,
            "full_text_from_pdf": text
        }

    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}


# --- API Endpoints ---
@app.route('/')
def index():
    return "<h1>Certificate Verification API</h1><p>POST a PDF file to /api/verify</p>"

@app.route('/api/verify', methods=['POST'])
def handle_verify_request():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
        
    if file and file.filename.endswith('.pdf'):
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
        return jsonify({"error": "Invalid file type. Please upload a PDF file."}), 400

# --- Run the Application ---
if __name__ == '__main__':
    app.run(port=5000, debug=True)
