# RidePals.ai

RidePals.ai is a college ridesharing platform for the Bay Area, connecting students for safe, affordable rides with unique pit-stop benefits at local businesses.

## Project Overview

RidePals.ai provides:
- College-specific ridesharing for Bay Area students
- Local, intercampus, and recurring ride options
- Unique pit-stop feature with discounts at local businesses
- Verified college community for safety and trust

## Technology Stack

### Frontend
- Next.js 15+ with React 19
- TypeScript
- Tailwind CSS with shadcn/ui components
- Mapbox for visualization

### Backend
- FastAPI (Python)
- PostgreSQL (with basic geo functions)
- Firebase Auth
- Stripe for payments
- Mapbox Directions API

## Project Status

Phases completed:
- ✅ Phase 1: Foundation & Setup
- ✅ Phase 2: Core Backend Development (Authentication, User System, API Fundamentals)
- ✅ Phase 3: Ride Management (Ride Creation, Search, Booking)
- ✅ Pit Stop Integration

Next steps:
- Phase 4: Payments & Reviews (Stripe Integration)
- Phase 5: Frontend Integration
- Phase 6: Testing & Optimization
- Phase 7: Launch Preparation

## Project Phases

### Phase 1: Foundation & Setup (2 weeks)
- **Repository Setup**
  - Create GitHub repo with branch protection rules
  - Set up CI/CD pipeline (GitHub Actions)
  - Configure linting and code formatting tools

- **Development Environment**
  - Set up FastAPI project structure
  - Create Docker development environment
  - Configure database migrations with Alembic

- **Infrastructure**
  - Provision database (PostgreSQL on RDS or similar)
  - Set up Staging/Development environments
  - Configure authentication services (Firebase Auth)

### Phase 2: Core Backend Development (4 weeks)
- **Authentication & User System**
  - Build Firebase Auth integration
  - Implement .edu email verification
  - Create user profiles and college affiliation

- **Database Models**
  - Design schema for users, colleges, rides, reviews
  - Set up geolocation models (with basic geo functions)
  - Implement data validation

- **API Fundamentals**
  - Create CRUD endpoints for profiles
  - Build college selection/filtering API
  - Implement session management

- **Testing Infrastructure**
  - Set up unit and integration testing
  - Create test data fixtures
  - Build automated test pipeline

### Phase 3: Ride Management (3 weeks)
- **Ride Creation & Search**
  - Implement ride posting endpoints
  - Build search functionality with filters (college, time, gender)
  - Create recurring ride generation

- **Location & Routing**
  - Integrate Mapbox for route calculation
  - Build distance-based search
  - Implement basic location-based pricing

- **Ride Booking**
  - Develop seat reservation system
  - Create ride confirmation flow
  - Build ride cancellation functionality

- **Pit Stop Integration**
  - Create pit stop database and API
  - Implement pit stop selection during ride creation
  - Build discount display system

### Phase 4: Payments & Reviews (2 weeks)
- **Payment System**
  - Integrate Stripe for payments
  - Build payment flow for ride bookings
  - Implement receipt generation

- **Review System**
  - Create rating/review functionality
  - Build average rating calculation
  - Implement user reputation system

- **Notifications**
  - Set up email notifications for bookings
  - Create ride status update alerts
  - Implement booking confirmations

### Phase 5: Frontend Integration (4 weeks)
- **Core UI Components**
  - Integrate backend APIs with existing UI
  - Build authentication flows
  - Create profile management screens

- **Ride Management UI**
  - Integrate map visualization
  - Build ride search interface
  - Create booking flow

- **College & Pit Stop UI**
  - Implement college selection
  - Create pit stop browsing interface
  - Build ride filters

- **Payment & Review UI**
  - Implement payment form integration
  - Create review submission interface
  - Build receipt display

### Phase 6: Testing & Optimization (2 weeks)
- **Performance Testing**
  - Load test critical endpoints
  - Optimize database queries
  - Implement caching for common routes

- **Security Audit**
  - Conduct vulnerability assessment
  - Implement security best practices
  - Test payment flow security

- **Frontend Optimization**
  - Performance testing and improvements
  - Mobile responsiveness testing
  - Browser compatibility testing

### Phase 7: Launch Preparation (2 weeks)
- **Production Environment**
  - Finalize production infrastructure
  - Set up monitoring and error tracking
  - Configure backup systems

- **Documentation**
  - Create API documentation
  - Build internal knowledge base
  - Prepare user guides

- **Launch Checklist**
  - Final QA testing
  - Deployment rehearsal
  - Staged rollout plan

### Phase 8: Launch & Immediate Support (1 week)
- **Deployment**
  - Staged rollout to production
  - Monitor system stability
  - Address immediate issues

- **User Support**
  - Implement feedback channels
  - Create support processes
  - Monitor user experience

- **Analytics Setup**
  - Configure usage tracking
  - Set up conversion funnels
  - Prepare for data collection

### Phase 9: Post-Launch Enhancements (Ongoing)
- **Data-Driven Improvements**
  - Analyze early usage patterns
  - Implement quick wins based on feedback
  - Prioritize enhancement backlog

- **Advanced Features**
  - Group orders
  - Advanced pricing model
  - Community features

- **Scaling Infrastructure**
  - Optimize for growing usage
  - Implement additional caching
  - Scale database as needed

## Getting Started

### Frontend Development
```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

### Backend Development
```bash
# Navigate to backend directory
cd backend

# Using Docker (recommended)
docker-compose up -d
docker-compose exec api python setup_db.py

# Or running locally
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python setup_db.py
uvicorn app.main:app --reload
```

The backend API will be available at http://localhost:8000 with documentation at http://localhost:8000/docs

## Contributing

Please read our contribution guidelines before submitting a pull request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.