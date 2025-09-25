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
from PIL import Image # For handling image files

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
def file_to_image(file_path, dpi=150): # Lowered DPI for performance
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


# --- Core Verification Logic (Certificate ID based) ---
def verify_certificate(pdf_path):
    try:
        # 1. Convert file to image
        np_img = file_to_image(pdf_path)

        # 2. OCR extraction
        results = reader.readtext(np_img)
        text = " ".join([r[1] for r in results])
        print("DEBUG: OCR Extracted Text:", text)

        # --- Helpers ---
        def normalize_text(s: str) -> str:
            s = str(s).lower().replace(" ", "")
            s = s.replace(",", "").replace(".", "")
            return s

        # 3. Extract certificate ID via regex
        cert_match = re.search(r'CER ID\s*:\s*(\d{11})', text, re.IGNORECASE)
        cert_id = cert_match.group(1) if cert_match else None
        print(f"DEBUG: Found Certificate ID: {cert_id}")

        # If no certificate ID is found in the text at all
        if not cert_id:
            return {
                "filename": os.path.basename(pdf_path),
                "certificate_id_found": None,
                "is_verified": False,
                "error": "Could not find a valid Certificate ID in the document."
            }

        # 4. Lookup in DB
        matched_record = None
        for record in records:
            if str(record.get("certificate_id", "")) == cert_id:
                matched_record = record
                break
        
        print(f"DEBUG: Matched DB Record: {matched_record}")
        
        if not matched_record:
            return {
                "filename": os.path.basename(pdf_path),
                "certificate_id_found": cert_id,
                "is_verified": False,
                "error": "Certificate ID was found, but it does not match any record in the database."
            }

        # 5. Cross-verify other fields with OCR text
        mismatches = []
        normalized_ocr_text = normalize_text(text)
        
        for field in ["name", "cgpa", "branch", "college"]:
            db_value = str(matched_record.get(field, ""))
            if normalize_text(db_value) not in normalized_ocr_text:
                mismatches.append(field)
                print(f"DEBUG: Mismatch found for field '{field}'. DB value: '{db_value}'")
        
        print(f"DEBUG: Mismatches: {mismatches}")
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
    app.run(port=5001, debug=True)

