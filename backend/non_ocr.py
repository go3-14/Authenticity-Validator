import re
import json
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import easyocr
import cv2
from PIL import Image
import fitz  # PyMuPDF

# Import your Siamese model verification function
from signature_verifier import verify_signature

# --- Flask App Initialization ---
app = Flask(__name__)
CORS(app)

# --- Configuration ---
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# --- Load Database ---
try:
    with open("database.json", "r") as f:
        records = json.load(f)
    print("Database loaded successfully.")
except FileNotFoundError:
    records = []
    print("Warning: 'database.json' not found. Running with empty DB.")

# --- Load EasyOCR ---
print("Loading EasyOCR model...")
reader = easyocr.Reader(['en'], gpu=False)
print("EasyOCR model loaded.")

# --- PDF/Image to NumPy Array ---
def file_to_image(file_path, dpi=100):
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        doc = fitz.open(file_path)
        page = doc.load_page(0)
        pix = page.get_pixmap(dpi=dpi)
        img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, 3)
        return img
    elif ext in [".jpg", ".jpeg", ".png"]:
        img = Image.open(file_path)
        if img.mode != "RGB":
            img = img.convert("RGB")
        return np.array(img)
    else:
        raise ValueError(f"Unsupported file type: {ext}")

# --- Core Verification Function ---
def verify_certificate(pdf_path, signature_threshold=60.0):
    """
    Verify certificate fields and signature.

    signature_threshold: float
        Maximum Euclidean distance for signature to be considered genuine.
    """
    try:
        # 1. Convert to image
        np_img = file_to_image(pdf_path, dpi=100)

        # 2. Resize to prevent memory overload
        h, w = np_img.shape[:2]
        scale = 1024 / max(h, w)
        if scale < 1.0:
            np_img = cv2.resize(np_img, (int(w*scale), int(h*scale)))

        # 3. OCR extraction
        results = reader.readtext(np_img)
        text = " ".join([r[1] for r in results])
        print("DEBUG: OCR Text:", text)

        # --- Helper to normalize text ---
        def normalize_text(s: str) -> str:
            return str(s).lower().replace(" ", "").replace(",", "").replace(".", "")

        # 4. Extract Certificate ID
        cert_match = re.search(r'CER ID\s*:\s*(\d{11})', text, re.IGNORECASE)
        cert_id = cert_match.group(1) if cert_match else None

        if not cert_id:
            return {
                "filename": os.path.basename(pdf_path),
                "certificate_id_found": None,
                "is_verified": False,
                "error": "Certificate ID not found."
            }

        # 5. Lookup DB
        matched_record = next((r for r in records if str(r.get("certificate_id", "")) == cert_id), None)
        if not matched_record:
            return {
                "filename": os.path.basename(pdf_path),
                "certificate_id_found": cert_id,
                "is_verified": False,
                "error": "Certificate ID not in database."
            }

        # 6. Verify fields
        mismatches = []
        norm_text = normalize_text(text)
        for field in ["name", "cgpa", "branch", "college"]:
            db_val = str(matched_record.get(field, ""))
            if normalize_text(db_val) not in norm_text:
                mismatches.append(field)

        # 7. Signature Verification
        distance, is_genuine = None, None
        ref_sig_path = matched_record.get("signature_image_path")
        if ref_sig_path and os.path.exists(ref_sig_path):
            temp_img_path = pdf_path.replace(".pdf", ".png")
            cv2.imwrite(temp_img_path, cv2.cvtColor(np_img, cv2.COLOR_RGB2BGR))
            distance, is_genuine = verify_signature(temp_img_path, ref_sig_path, threshold=signature_threshold)
            os.remove(temp_img_path)

        # 8. Determine overall verification
        is_signature_valid = is_genuine if is_genuine is not None else True
        is_verified = (len(mismatches) == 0) and is_signature_valid

        # 9. Return result
        return {
            "filename": os.path.basename(pdf_path),
            "certificate_id_found": cert_id,
            "is_verified": is_verified,
            "database_record": matched_record,
            "mismatched_fields": mismatches,
            "full_text_from_pdf": text,
            "signature_distance": distance,
            "signature_status": "Genuine" if is_genuine else "Forged" if is_genuine==False else "Reference missing"
        }

    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}

# --- API Endpoint ---
@app.route('/api/verify', methods=['POST'])
def handle_verify_request():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    filename = file.filename
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    try:
        file.save(filepath)
        result = verify_certificate(filepath, signature_threshold=60.0)
        print(f"Signature Verification: {result.get('signature_status', 'Unknown')}")
        return jsonify(result)
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)

# --- Run App ---
if __name__ == '__main__':
    app.run(port=5001, debug=True)
