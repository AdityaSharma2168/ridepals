from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from decouple import config

# Get database connection string from environment variables
# For development, using SQLite for demonstration
DATABASE_URL = config(
    "DATABASE_URL", 
    default="sqlite:///./ridepals.db"
)

# Create SQLAlchemy engine - disable echo in production
engine = create_engine(
    DATABASE_URL,
    echo=config("DEBUG", default=False, cast=bool),
    pool_pre_ping=True,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 