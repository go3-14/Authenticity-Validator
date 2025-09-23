import re, json, hashlib
from pdf2image import convert_from_path
from PIL import Image
import numpy as np
import easyocr
from rapidfuzz import fuzz

# Load DB   
with open("old.json", "r") as f:
    records = json.load(f)

reader = easyocr.Reader(['en'], gpu=False)

def verify_certificate(pdf_path):
    

    # Convert PDF -> Image
    pages = convert_from_path(pdf_path, dpi=300)
    img = pages[0]

    # OCR
    np_img = np.array(img)
    results = reader.readtext(np_img)
    text = " ".join([r[1] for r in results])

    # Parse (simple demo)
    roll_match = re.search(r"R\d{4}[A-Z]{2}\d{3}", text)
    roll = roll_match.group(0) if roll_match else None

    # DB check
    matched = None
    for r in records:
        if roll and r["rollno"] == roll:
            matched = r

    return {
        
        "rollno": roll,
        "db_match": bool(matched),
        "db_result": matched
    }

# Test
print(verify_certificate("certificate1.pdf"))
