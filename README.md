# Global Expansion Management API

A comprehensive backend system for Expanders360 that helps founders manage expansion projects in new countries. The system combines structured relational data (SQLite) with unstructured research documents (MongoDB) to power intelligent project-vendor matching.

## 🏗️ Architecture Overview

### Tech Stack

- **Framework**: NestJS (TypeScript)
- **Relational Database**: SQLite with TypeORM
- **Document Database**: MongoDB with Mongoose
- **Authentication**: JWT with role-based access control
- **Scheduling**: NestJS Schedule with Cron jobs
- **Notifications**: SMTP email integration
- **Containerization**: Docker & Docker Compose

### Database Schema

#### SQLite (Relational Data)

```
clients
├── id (PK)
├── company_name
├── contact_email (unique)
├── password (hashed)
├── role (client/admin)
└── timestamps

projects
├── id (PK)
├── client_id (FK)
├── country
├── services_needed (JSON array)
├── budget
├── status (active/completed/on_hold/cancelled)
└── timestamps

vendors
├── id (PK)
├── name
├── countries_supported (JSON array)
├── services_offered (JSON array)
├── rating (0-5)
├── response_sla_hours
├── is_active
└── timestamps

matches
├── id (PK)
├── project_id (FK)
├── vendor_id (FK)
├── score (calculated match score)
└── timestamps
```

#### MongoDB (Document Data)

```javascript
ResearchDocument {
  title: String,
  content: String,
  tags: [String],
  projectId: Number,
  fileUrl?: String,
  fileType?: String,
  fileSize?: Number,
  uploadedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- Docker (optional)

### Local Development Setup

1. **Clone and install dependencies**

```bash
git clone <repository-url>
cd global-expansion-management-api
npm install
```

2. **Environment Configuration**

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start MongoDB** (if running locally)

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7

# Or install MongoDB locally
```

4. **Seed the databases**

```bash
npm run seed:all
```

5. **Start the development server**

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📚 API Documentation

### Authentication Endpoints

#### Register Client

```http
POST /auth/register
Content-Type: application/json

{
  "company_name": "TechCorp",
  "email": "client@techcorp.com",
  "password": "password123",
  "role": "client"
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "client@techcorp.com",
  "password": "password123"
}
```

#### Get Profile

```http
GET /auth/profile
Authorization: Bearer <jwt-token>
```

### Project Management

#### Create Project

```http
POST /projects
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "country": "Germany",
  "services_needed": ["legal", "accounting"],
  "budget": 50000,
  "status": "active"
}
```

#### Get Projects

```http
GET /projects
Authorization: Bearer <jwt-token>
```

#### Rebuild Project Matches

```http
POST /projects/:id/matches/rebuild
Authorization: Bearer <jwt-token>
```

#### Get Project Matches

```http
GET /projects/:id/matches
Authorization: Bearer <jwt-token>
```

### Vendor Management (Admin Only)

#### Create Vendor

```http
POST /vendors
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "name": "Global Expansion Partners",
  "countries_supported": ["USA", "Canada", "UK"],
  "services_offered": ["legal", "accounting", "hr"],
  "rating": 4.8,
  "response_sla_hours": 12
}
```

#### Get Vendors

```http
GET /vendors
Authorization: Bearer <jwt-token>
```

### Research Documents

#### Upload Document

```http
POST /research
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "German Market Analysis",
  "content": "Detailed market analysis...",
  "tags": ["germany", "market-analysis"],
  "projectId": 1
}
```

#### Search Documents

```http
GET /research/search?text=germany&tags=market-analysis&projectId=1
Authorization: Bearer <jwt-token>
```

### Analytics

#### Top Vendors by Country

```http
GET /analytics/top-vendors
Authorization: Bearer <jwt-token>
```

#### System Statistics (Admin Only)

```http
GET /analytics/matching-stats
GET /analytics/project-stats
GET /analytics/vendor-stats
Authorization: Bearer <admin-jwt-token>
```

## 🔄 Matching Algorithm

The system uses an intelligent matching algorithm to connect projects with suitable vendors:

### Matching Formula

```
Score = (Service Overlap × 2) + Vendor Rating + SLA Weight

Where:
- Service Overlap: Number of matching services between project needs and vendor offerings
- Vendor Rating: 0-5 star rating
- SLA Weight: Bonus points based on response time
  - ≤4 hours: +2 points
  - ≤12 hours: +1.5 points
  - ≤24 hours: +1 point
  - ≤48 hours: +0.5 points
  - >48 hours: 0 points
```

### Matching Rules

1. **Country Support**: Vendor must support the project's target country
2. **Service Overlap**: At least one service must match
3. **Active Status**: Only active vendors are considered
4. **Idempotent Updates**: Matches are rebuilt completely on each run

## ⏰ Scheduled Jobs

### Daily Match Refresh (2:00 AM)

- Rebuilds matches for all active projects
- Sends notifications for high-score matches (≥8.0)
- Generates daily summary report

### SLA Monitoring (9:00 AM)

- Identifies vendors with expired SLAs
- Sends alerts to administrators
- Tracks response time violations

## 📧 Notifications

The system supports email notifications via SMTP:

### Notification Types

1. **New Match Alerts**: Sent when high-quality matches are found
2. **SLA Violations**: Alerts for vendors exceeding response times
3. **Daily Summaries**: Match processing reports for administrators

### Configuration

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ENABLE_EMAIL_NOTIFICATIONS=true
```

## 🔐 Security Features

### Authentication & Authorization

- JWT-based authentication
- Role-based access control (client/admin)
- Password hashing with bcrypt
- Protected routes with guards

### Data Protection

- Input validation with class-validator
- SQL injection prevention via TypeORM
- NoSQL injection prevention via Mongoose
- Environment variable configuration

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📊 Monitoring & Logging

The application includes comprehensive logging:

- Request/response logging
- Database query logging (development)
- Scheduled job execution logs
- Error tracking and notifications

## 🚀 Deployment Options

### Cloud Platforms

- **Railway**: `railway up`
- **Render**: Connect GitHub repository
- **AWS Free Tier**: Use ECS or Elastic Beanstalk
- **Heroku**: `git push heroku main`

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_PATH=/app/data/database.sqlite
MONGODB_URI=mongodb://your-mongo-host:27017/db
JWT_SECRET=your-super-secure-secret
SMTP_HOST=your-smtp-host
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
```

## 🔧 Development

### Project Structure

```
src/
├── auth/              # Authentication & authorization
├── entities/          # TypeORM entities (SQLite)
├── schemas/           # Mongoose schemas (MongoDB)
├── projects/          # Project management
├── vendors/           # Vendor management
├── research/          # Document management
├── analytics/         # Cross-database analytics
├── notifications/     # Email & scheduling
└── database/          # Seeds & migrations
```

### Key Design Patterns

- **Dependency Injection**: NestJS IoC container
- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic separation
- **DTO Pattern**: Data validation and transformation
- **Guard Pattern**: Route protection and authorization

## 📈 Performance Considerations

- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient database connections
- **Caching**: In-memory caching for frequently accessed data
- **Pagination**: Large dataset handling
- **Async Processing**: Non-blocking operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## Test Credentials

After running the seed script, you can use these test accounts:

- **Admin**: `admin@expanders360.com` / `admin123`
- **Client**: `client@techcorp.com` / `client123`
