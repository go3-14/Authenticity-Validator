from flask import Flask,jsonify
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
