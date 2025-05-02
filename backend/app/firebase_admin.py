"""
Firebase Admin SDK initialization and authentication utilities.
"""
import os
import json
from pathlib import Path
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth, initialize_app, credentials
from loguru import logger

# Initialize Firebase Admin SDK with service account credentials
service_account_path = Path(__file__).parent.parent / os.getenv("FIREBASE_PRIVATE_KEY_PATH", "firebase/service-account.json")

try:
    if service_account_path.exists():
        # Initialize with service account file
        cred = credentials.Certificate(service_account_path)
        firebase_app = initialize_app(cred)
        logger.info("Firebase Admin SDK initialized successfully with service account credentials.")
    else:
        # Try environment variables if file doesn't exist
        project_id = os.getenv("FIREBASE_PROJECT_ID")
        if project_id:
            # Create credentials from environment variables
            cred = credentials.ApplicationDefault()
            firebase_app = initialize_app(cred, {"projectId": project_id})
            logger.info("Firebase Admin SDK initialized with application default credentials.")
        else:
            raise ValueError("No Firebase credentials available")
except Exception as e:
    logger.error(f"Error initializing Firebase Admin SDK: {str(e)}")
    # We'll continue execution but authentication will fail

# Set up the bearer token security scheme
bearer_scheme = HTTPBearer(auto_error=True)

# Python dataclass to represent a Firebase user
class FirebaseUser:
    def __init__(self, uid, email=None, email_verified=False, name=None):
        self.uid = uid
        self.email = email
        self.email_verified = email_verified
        self.name = name

# Dependency to validate the Firebase token and get the user
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    """
    Dependency to get the current authenticated user from a Firebase token.
    """
    try:
        # Extract the token
        token = credentials.credentials
        
        # Verify the token
        decoded_token = auth.verify_id_token(token)
        
        # Extract user information
        uid = decoded_token.get("uid")
        email = decoded_token.get("email")
        email_verified = decoded_token.get("email_verified", False)
        name = decoded_token.get("name")
        
        logger.info(f"Successfully verified token for user: {uid} ({email})")
        
        # Return a FirebaseUser object
        return FirebaseUser(uid=uid, email=email, email_verified=email_verified, name=name)
        
    except Exception as e:
        logger.error(f"Error verifying Firebase token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        ) 