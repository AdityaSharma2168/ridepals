"""
Firebase authentication utilities.
"""
import firebase_admin
from firebase_admin import auth, credentials
from decouple import config
from fastapi import Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.utils.errors import UnauthorizedError

# Initialize Firebase with credentials
try:
    # In production, load credentials from environment variables
    if config("FIREBASE_USE_SERVICE_ACCOUNT", cast=bool, default=False):
        cred = credentials.Certificate({
            "type": "service_account",
            "project_id": config("FIREBASE_PROJECT_ID"),
            "private_key_id": config("FIREBASE_PRIVATE_KEY_ID"),
            "private_key": config("FIREBASE_PRIVATE_KEY").replace("\\n", "\n"),
            "client_email": config("FIREBASE_CLIENT_EMAIL"),
            "client_id": config("FIREBASE_CLIENT_ID"),
            "auth_uri": config("FIREBASE_AUTH_URI", default="https://accounts.google.com/o/oauth2/auth"),
            "token_uri": config("FIREBASE_TOKEN_URI", default="https://oauth2.googleapis.com/token"),
            "auth_provider_x509_cert_url": config("FIREBASE_AUTH_PROVIDER_X509_CERT_URL", 
                                                default="https://www.googleapis.com/oauth2/v1/certs"),
            "client_x509_cert_url": config("FIREBASE_CLIENT_X509_CERT_URL"),
        })
    else:
        # In development, you can use application default credentials or a local service account
        cred = credentials.ApplicationDefault()
    
    firebase_app = firebase_admin.initialize_app(cred)
except (ValueError, firebase_admin.exceptions.FirebaseError):
    # If Firebase app is already initialized
    firebase_app = firebase_admin.get_app()
except Exception as e:
    print(f"Error initializing Firebase: {e}")
    # Proceed without Firebase in development if needed
    firebase_app = None

# Bearer token authentication scheme
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Validate Firebase ID token from Authorization header and return the user.
    """
    if not firebase_app:
        # For development without Firebase
        if config("DEBUG", cast=bool, default=False):
            # In debug mode, allow a test user ID
            # This is for development only and should be removed in production
            return {"uid": "test-user-id"}
        else:
            raise UnauthorizedError("Firebase authentication not configured")
    
    try:
        token = credentials.credentials
        # Verify the token with Firebase
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise UnauthorizedError(f"Invalid authentication token: {str(e)}")

async def verify_edu_email(email: str) -> bool:
    """
    Verify if the email is a valid .edu email.
    """
    return email.endswith('.edu')

async def create_firebase_user(email: str, password: str, display_name: str = None):
    """
    Create a new user in Firebase Authentication.
    """
    if not firebase_app:
        raise UnauthorizedError("Firebase authentication not configured")
    
    try:
        user = auth.create_user(
            email=email,
            password=password,
            display_name=display_name,
            email_verified=False  # Will be verified through the .edu verification process
        )
        return user
    except Exception as e:
        raise UnauthorizedError(f"Error creating Firebase user: {str(e)}")

async def send_verification_email(user_id: str):
    """
    Send a verification email to the user.
    """
    if not firebase_app:
        raise UnauthorizedError("Firebase authentication not configured")
    
    try:
        # Generate email verification link
        link = auth.generate_email_verification_link(
            auth.get_user(user_id).email
        )
        # In a production app, you would send this link via email
        return link
    except Exception as e:
        raise UnauthorizedError(f"Error sending verification email: {str(e)}")

async def get_firebase_user(user_id: str):
    """
    Get a user from Firebase by ID.
    """
    if not firebase_app:
        if config("DEBUG", cast=bool, default=False):
            # Mock user for development
            return {"uid": user_id, "email": "test@university.edu"}
        else:
            raise UnauthorizedError("Firebase authentication not configured")
    
    try:
        return auth.get_user(user_id)
    except Exception as e:
        raise UnauthorizedError(f"Error getting Firebase user: {str(e)}") 