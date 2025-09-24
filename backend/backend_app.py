'''from flask import Flask,jsonify

from flask_cors import CORS 

app = Flask(__name__)
CORS(app) 

@app.route('/api/data')
def get_data():
    data = {
        "name": "Avannish",
        "age": 21,
        "skills": ["React", "Python", "PWA"]
    }
    return jsonify(data)

if __name__ == '__main__':
    app.run(port=5000, debug=True)
'''

import requests

# The URL of your local API endpoint
API_URL = "http://127.0.0.1:5000/api/verify"
# The path to the file you want to test
FILE_PATH = "test_certificate.pdf"

try:
    with open(FILE_PATH, 'rb') as f:
        # The key 'file' must match the key expected by your Flask app
        files = {'file': (FILE_PATH, f, 'application/pdf')}
        
        response = requests.post(API_URL, files=files)
        
        # Print the server's response
        print(f"Status Code: {response.status_code}")
        print("Response JSON:")
        print(response.json())

except FileNotFoundError:
    print(f"Error: The file '{FILE_PATH}' was not found.")
except requests.exceptions.RequestException as e:
    print(f"An error occurred with the request: {e}")