from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import timedelta, datetime, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext

# --- Configuration ---
# In a real app, these would be in a config file
SECRET_KEY = "your-super-secret-key-that-no-one-should-know"
ALGORITHM = "HS256" # ✅ FIX: Corrected typo from HS265 to HS256
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# --- App Initialization ---
app = Flask(__name__)

# --- CORS (Cross-Origin Resource Sharing) ---
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# --- Security and Hashing ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- Dummy User Database ---
# In a real application, you would connect to a database like PostgreSQL or MySQL.
# The password "test" is hashed for the initial user.
fake_users_db = {
    "user@example.com": {
        "username": "user@example.com",
        "full_name": "Test User",
        "hashed_password": pwd_context.hash("test"),
    }
}

# --- Helper Functions ---
def verify_password(plain_password, hashed_password):
    """Checks if the plain password matches the hashed password."""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """Creates a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        # ✅ FIX: Updated to use the non-deprecated, timezone-aware version
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- API Endpoints ---
@app.route("/")
def read_root():
    return jsonify(message="Authentication server is running.")

@app.route("/register/", methods=['POST'])
def register_user():
    """
    Handles user registration and immediately logs them in by returning an access token.
    """
    email = request.form.get('email')
    password = request.form.get('password')
    full_name = request.form.get('fullName')

    if not email or not password or not full_name:
        return jsonify({"detail": "Missing email, password, or full name"}), 400

    if email in fake_users_db:
        return jsonify({"detail": "Email already registered"}), 409 # 409 Conflict

    # Create the new user
    hashed_password = pwd_context.hash(password)
    fake_users_db[email] = {
        "username": email,
        "full_name": full_name,
        "hashed_password": hashed_password,
    }

    # Automatically log the new user in
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": email}, expires_delta=access_token_expires
    )
    
    return jsonify(access_token=access_token, token_type="bearer")


@app.route("/login/", methods=['POST'])
def login_for_access_token():
    """
    Handles the login request from your React form.
    """
    username = request.form.get('username')
    password = request.form.get('password')

    if not username or not password:
        return jsonify({"detail": "Username and password are required"}), 400

    user = fake_users_db.get(username)
    if not user or not verify_password(password, user["hashed_password"]):
        return jsonify({"detail": "Incorrect username or password"}), 401
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    
    return jsonify(access_token=access_token, token_type="bearer")

# --- How to Run This Server ---
# 1. Save this code as auth_backend.py
# 2. Open a terminal in the same directory.
# 3. **Install/Fix Dependencies:** If you are seeing errors, run the following commands in order.
#    This will remove conflicting versions and install the correct ones.
#    pip uninstall bcrypt passlib -y
#    pip install Flask Flask-Cors "python-jose[cryptography]" bcrypt==3.2.0 passlib
# 4. Run the following command:
#    python auth_backend.py
if __name__ == '__main__':
    app.run(host="127.0.0.1", port=8000, debug=True)

