# RidePals.ai Backend

This is the FastAPI backend for the RidePals.ai college ridesharing platform.

## Features

- **College Management**
  - List of Bay Area colleges with geolocation
  - College filtering and selection

- **User Authentication**
  - Firebase-based authentication
  - College email (.edu) verification
  - User profiles with ratings

- **Ride Management**
  - Ride creation and booking
  - College-specific and intercampus rides
  - Search and filtering (by college, date, price)
  - Support for recurring rides
  - Women-only ride option

- **Pit Stops**
  - Local businesses near colleges
  - Special discounts for RidePals users
  - Integration with ride planning

- **Ratings & Reviews**
  - User rating system
  - Ride-specific reviews
  - Driver and passenger ratings

## Getting Started

### Prerequisites

- Python 3.10+
- PostgreSQL
- Docker and Docker Compose (optional)

### Running with Docker

The easiest way to run the backend is with Docker Compose:

```bash
# Build and start the containers
docker-compose up -d

# Run database migrations and seed data
docker-compose exec api python setup_db.py
```

The API will be available at http://localhost:8000.

### Running Locally

1. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Set up environment variables:

```bash
# Create a .env file
echo "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ridepals" > .env
echo "DEBUG=true" >> .env
```

4. Run the database setup script:

```bash
python setup_db.py
```

5. Start the development server:

```bash
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000.

## API Documentation

Once the server is running, you can access the auto-generated API documentation at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

- **Authentication**
  - POST `/auth/register` - Register a new user
  - POST `/auth/verify-edu-email` - Verify college email
  - GET `/auth/me` - Get current user profile

- **Users**
  - GET `/users/{user_id}` - Get user profile
  - PUT `/users/me` - Update current user profile
  - GET `/users/{user_id}/ratings` - Get user ratings
  - GET `/users/{user_id}/profile` - Get complete user profile with ratings

- **Colleges**
  - GET `/colleges/` - Get all colleges
  - GET `/colleges/{college_id}` - Get specific college

- **Rides**
  - POST `/rides/` - Create a new ride
  - GET `/rides/` - Search for rides
  - GET `/rides/{ride_id}` - Get specific ride
  - POST `/rides/book` - Book a ride
  - GET `/rides/my/driver` - Get rides where user is driver
  - GET `/rides/my/passenger` - Get rides where user is passenger

- **Pit Stops**
  - GET `/pitstops/` - Get all pit stops
  - GET `/pitstops/{pit_stop_id}` - Get specific pit stop
  - GET `/pitstops/college/{college_id}` - Get pit stops by college
  - GET `/pitstops/nearby/{latitude}/{longitude}` - Get nearby pit stops

- **Ratings**
  - POST `/ratings/` - Create a new rating
  - GET `/ratings/user/{user_id}` - Get ratings for user
  - GET `/ratings/ride/{ride_id}` - Get ratings for ride

## Project Structure

```
backend/
├── alembic/              # Database migrations
├── app/
│   ├── api/              # API endpoints
│   ├── models/           # Database models
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── seeds/            # Seed data
│   ├── database.py       # Database configuration
│   └── main.py           # FastAPI application entry point
├── docker-compose.yml    # Docker configuration
├── Dockerfile            # Docker build instructions
├── requirements.txt      # Python dependencies
└── setup_db.py           # Database setup script
```

## Development

### Creating a New Migration

```bash
alembic revision --autogenerate -m "Description of changes"
```

### Running Migrations

```bash
alembic upgrade head
```

### Testing

```bash
pytest
``` 