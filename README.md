# Above Sky Calendar - Family Task Management System

A comprehensive full-stack family task management application built with Spring Boot (backend) and Angular (frontend). Inspired by Skylight Calendar, this system provides calendar, tasks, rewards, meals, photos, and lists functionality designed for family coordination.

## 🚀 API-First Development

This project follows an **API-First approach** using OpenAPI 3.0 specification. All API endpoints are defined in `spec.yaml`, and both backend and frontend code are automatically generated from this specification.

**📖 See the [API-First Development Guide](API_FIRST_GUIDE.md) for detailed documentation on:**
- How to work with the OpenAPI specification
- Code generation for backend and frontend
- Adding new endpoints
- Best practices and troubleshooting

### Quick Start with API-First

1. **View the API specification**: `spec.yaml` (root directory)
2. **Generate backend code**: `cd backend && mvn clean generate-sources`
3. **Generate frontend code**: `cd frontend && npm run generate-api`
4. **View API docs**: `http://localhost:8080/swagger-ui.html` (when backend is running)

## 🐳 Quick Start with Docker

The easiest way to run the entire application stack:

```bash
# 1. Clone the repository
git clone https://github.com/Coenni/above-sky-calendar.git
cd above-sky-calendar

# 2. Copy and configure environment variables
cp .env.example .env
# Edit .env with your configuration

# 3. Start all services (backend, frontend, database, ELK, MailHog, Nginx)
./scripts/start-local.sh
```

**Access the application:**
- **Frontend:** http://localhost:4200
- **Backend API:** http://localhost:8080/api
- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **Kibana (Logs):** http://localhost:5601
- **MailHog (Emails):** http://localhost:8025

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Technology Stack

### Backend
- **Spring Boot 3.2.0** - Java framework for building REST APIs
- **Spring Data JPA** - Data persistence layer
- **Spring Security** - Authentication and authorization
- **JWT 0.12.3** - Token-based authentication
- **PostgreSQL 15** - Production database
- **H2 Database** - In-memory database for development
- **Lombok** - Reduce boilerplate code
- **Maven** - Dependency management
- **OpenAPI Generator** - Automatic API code generation
- **SpringDoc OpenAPI** - API documentation (Swagger UI)
- **Spring Boot Actuator** - Health checks and metrics
- **Logstash Encoder** - Structured logging for ELK stack

### Frontend
- **Angular 17** - Modern web framework with standalone components
- **TypeScript** - Type-safe JavaScript
- **RxJS** - Reactive programming
- **Angular Router** - Navigation and routing
- **HttpClient** - REST API communication
- **Axios** - HTTP client for generated API code
- **OpenAPI Generator** - Automatic TypeScript client generation

### Infrastructure
- **Docker & Docker Compose** - Containerization and orchestration
- **Nginx** - Reverse proxy and static file serving
- **Elasticsearch** - Log storage and search
- **Logstash** - Log processing and forwarding
- **Kibana** - Log visualization and analytics
- **MailHog** - Email testing (local development)

## Features

### 1. **User Authentication & Management**
- JWT-based authentication with secure login/register
- Family member profiles with custom colors and display names
- Role-based access (Parent/Admin vs Child/Standard)
- Reward points tracking per user

### 2. **Calendar System** (Enhanced)
- Create, read, update, and delete calendar events
- Event categories (appointments, activities, school, work, etc.)
- Color-coding for different family members
- All-day and timed events
- Recurring events support
- Multi-family member event assignment
- Reminder notifications configuration

### 3. **Task Management**
- Comprehensive task CRUD operations
- Task priority levels (high, medium, low)
- Task status tracking (pending, in_progress, completed)
- Task assignment to specific family members
- Reward points system integrated with tasks
- Task categories and tags
- Due dates and completion tracking
- Subtasks/checklist items support
- Task filtering by status and priority

### 4. **Rewards System**
- Reward catalog with customizable rewards
- Point cost and stock quantity management
- Reward redemption with approval workflow
- Redemption history tracking per user
- Points accumulation through task completion
- Automatic point deduction on redemption
- Reward categories and descriptions

### 5. **Meal Planning**
- Weekly meal planner functionality
- Meal categories (breakfast, lunch, dinner, snacks)
- Recipe storage with ingredients
- Favorite meals quick-access
- Dietary tags and preferences
- Meal assignment to specific dates
- Photo support for meals

### 6. **Photo Gallery**
- Photo upload and management
- Photo captions and comments
- Event association for photos
- Photo tagging and organization
- Sort by upload date or photo date
- User-specific photo galleries

### 7. **Lists Management**
- Multiple list types (shopping, todo, packing, wish lists, custom)
- Shared lists for family collaboration
- List item check-off functionality
- Item priority marking
- List archiving when completed
- Order management for list items

### 8. **Dashboard & Metrics**
- Comprehensive metrics for all features
- User-specific metrics (tasks, points, photos)
- System-wide statistics
- Quick access to all modules

## Project Structure

```
above-sky-calendar/
├── spec.yaml                          # OpenAPI 3.0 API Specification (single source of truth)
├── API_FIRST_GUIDE.md                 # Complete guide for API-First development
├── DEPLOYMENT.md                      # Deployment guide for all environments
├── docker-compose.yml                 # Main Docker Compose configuration
├── docker-compose.local.yml           # Local development overrides
├── docker-compose.stage.yml           # Staging environment overrides
├── docker-compose.prod.yml            # Production environment overrides
├── .env.example                       # Environment variables template
│
├── backend/                          # Spring Boot backend
│   ├── Dockerfile                    # Multi-stage build for backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/abovesky/calendar/
│   │   │   │   ├── api/              # Generated API interfaces (from spec.yaml)
│   │   │   │   ├── config/          # Security, JWT, Async configuration
│   │   │   │   ├── controller/      # REST API endpoint implementations
│   │   │   │   ├── service/         # Business logic (including EmailService)
│   │   │   │   ├── repository/      # Database access
│   │   │   │   ├── entity/          # JPA entities
│   │   │   │   └── dto/             # Data transfer objects
│   │   │   └── resources/
│   │   │       ├── application.yml         # Base configuration
│   │   │       ├── application-local.yml   # Local profile
│   │   │       ├── application-stage.yml   # Staging profile
│   │   │       ├── application-prod.yml    # Production profile
│   │   │       ├── logback-spring.xml      # Logging configuration
│   │   │       └── templates/              # Email templates (Thymeleaf)
│   │   └── test/                    # Unit tests
│   └── pom.xml                      # Maven dependencies + OpenAPI Generator
│
├── frontend/                         # Angular frontend
│   ├── Dockerfile                    # Multi-stage build for frontend
│   ├── nginx.conf                    # Nginx configuration for frontend container
│   ├── .env.local                    # Local environment variables
│   ├── .env.stage                    # Staging environment variables
│   ├── .env.prod                     # Production environment variables
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/          # UI components
│   │   │   ├── services/            # API services
│   │   │   ├── guards/              # Route guards
│   │   │   ├── interceptors/        # HTTP interceptors
│   │   │   └── models/              # TypeScript interfaces
│   │   ├── generated/               # Generated TypeScript API clients (from spec.yaml)
│   │   │   ├── api/                 # API client classes
│   │   │   └── models/              # TypeScript models
│   │   ├── assets/                  # Static assets
│   │   ├── index.html               # Main HTML file
│   │   └── main.ts                  # Application entry point
│   ├── angular.json                 # Angular configuration
│   ├── package.json                 # NPM dependencies + generate-api script
│   └── tsconfig.json                # TypeScript configuration
│
├── nginx/                            # Nginx reverse proxy configuration
│   ├── nginx.conf                    # Main Nginx configuration
│   └── conf.d/
│       └── default.conf              # Application routing configuration
│
├── logstash/                         # Logstash configuration for ELK
│   ├── config/
│   │   └── logstash.yml             # Logstash settings
│   └── pipeline/
│       └── logstash.conf            # Log processing pipeline
│
├── scripts/                          # Utility scripts
│   ├── start-local.sh               # Start local development
│   ├── start-stage.sh               # Start staging environment
│   ├── stop-all.sh                  # Stop all services
│   ├── logs.sh                      # View service logs
│   └── reset-db.sh                  # Reset local database
│
└── README.md                         # This file
```

## 🐳 Docker Deployment

### Services Included

The Docker setup includes the following services:

1. **Backend** - Spring Boot application (port 8080)
2. **Frontend** - Angular application served by Nginx (port 80)
3. **Nginx** - Reverse proxy for routing (ports 80, 443)
4. **PostgreSQL** - Database (port 5432)
5. **Elasticsearch** - Log storage (port 9200)
6. **Logstash** - Log processing (port 5000)
7. **Kibana** - Log visualization (port 5601)
8. **MailHog** - Email testing (ports 1025, 8025)

### Quick Start with Docker

```bash
# Start local development environment
./scripts/start-local.sh

# Start staging environment
./scripts/start-stage.sh

# Stop all services
./scripts/stop-all.sh

# View logs
./scripts/logs.sh backend -f

# Reset database (local only)
./scripts/reset-db.sh
```

### Environment Profiles

Three profiles are configured:

- **local** - H2 in-memory DB, MailHog, debug logging, hot-reload
- **stage** - PostgreSQL, real SMTP, info logging, ELK stack
- **prod** - PostgreSQL, real SMTP, warn logging, resource limits, ELK stack

### Access Services

After starting with `./scripts/start-local.sh`:

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:4200 | Angular application |
| Backend API | http://localhost:8080/api | REST API endpoints |
| Swagger UI | http://localhost:8080/swagger-ui.html | API documentation |
| Actuator Health | http://localhost:8080/actuator/health | Health check endpoint |
| Kibana | http://localhost:5601 | Log visualization |
| Elasticsearch | http://localhost:9200 | Log storage |
| MailHog UI | http://localhost:8025 | Email testing interface |
| PostgreSQL | localhost:5432 | Database (user: admin, db: aboveskycalendar) |

## Setup Instructions

### Prerequisites

- **Java 17+** - [Download](https://adoptium.net/)
- **Maven 3.6+** - [Download](https://maven.apache.org/download.cgi)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** - Comes with Node.js

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Generate API interfaces from OpenAPI spec and build:
   ```bash
   mvn clean install
   ```
   
   This will:
   - Generate Java API interfaces from `spec.yaml`
   - Compile the backend code
   - Run tests

3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```

   The backend server will start on `http://localhost:8080`

4. Access API documentation:
   - **Swagger UI**: `http://localhost:8080/swagger-ui.html`
   - **OpenAPI JSON**: `http://localhost:8080/v3/api-docs`

5. (Optional) Access the H2 console:
   - URL: `http://localhost:8080/h2-console`
   - JDBC URL: `jdbc:h2:mem:calendardb`
   - Username: `sa`
   - Password: (leave empty)

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate TypeScript API clients from OpenAPI spec:
   ```bash
   npm run generate-api
   ```
   
   This creates TypeScript API clients and models in `src/generated/`

4. Start the development server:
   ```bash
   npm start
   ```

   The frontend will start on `http://localhost:4200`

## Running the Application

1. **Start the Backend**: Run the Spring Boot application (port 8080)
2. **Start the Frontend**: Run the Angular development server (port 4200)
3. **Open Browser**: Navigate to `http://localhost:4200`
4. **Register**: Create a new account
5. **Login**: Sign in with your credentials
6. **Use the App**: Create and manage your calendar events

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- `POST /api/auth/login` - Login and receive JWT token
  ```json
  {
    "username": "johndoe",
    "password": "password123"
  }
  ```

### User Endpoints (Protected)

- `GET /api/users/me` - Get current user information
- `PUT /api/users/me` - Update current user information

### Event Endpoints (Protected)

- `GET /api/events` - Get all events for current user
- `GET /api/events/{id}` - Get a specific event
- `POST /api/events` - Create a new event
  ```json
  {
    "title": "Team Meeting",
    "description": "Weekly sync",
    "startDate": "2024-01-15T10:00:00",
    "endDate": "2024-01-15T11:00:00"
  }
  ```
- `PUT /api/events/{id}` - Update an event
- `DELETE /api/events/{id}` - Delete an event

### Task Endpoints (Protected)

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/user/{userId}` - Get tasks by assigned user
- `GET /api/tasks/status/{status}` - Get tasks by status (pending, in_progress, completed)
- `GET /api/tasks/{id}` - Get a specific task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/{id}` - Update a task
- `PUT /api/tasks/{id}/complete?userId={userId}` - Complete a task and award points
- `DELETE /api/tasks/{id}` - Delete a task

### Reward Endpoints (Protected)

- `GET /api/rewards` - Get all rewards
- `GET /api/rewards/active` - Get active rewards only
- `GET /api/rewards/affordable/{userId}` - Get rewards user can afford
- `GET /api/rewards/{id}` - Get a specific reward
- `POST /api/rewards` - Create a new reward
- `PUT /api/rewards/{id}` - Update a reward
- `DELETE /api/rewards/{id}` - Delete a reward
- `GET /api/rewards/redemptions/user/{userId}` - Get user's redemption history
- `POST /api/rewards/redeem` - Redeem a reward
- `PUT /api/rewards/redemptions/{id}/status` - Update redemption status

### Meal Endpoints (Protected)

- `GET /api/meals` - Get all meals
- `GET /api/meals/weekly?startDate={date}` - Get weekly meal plan
- `GET /api/meals/favorites` - Get favorite meals
- `GET /api/meals/category/{category}` - Get meals by category
- `GET /api/meals/{id}` - Get a specific meal
- `POST /api/meals` - Create a new meal
- `PUT /api/meals/{id}` - Update a meal
- `DELETE /api/meals/{id}` - Delete a meal

### Photo Endpoints (Protected)

- `GET /api/photos` - Get all photos
- `GET /api/photos/user/{userId}` - Get photos by user
- `GET /api/photos/event/{eventId}` - Get photos for an event
- `GET /api/photos/{id}` - Get a specific photo
- `POST /api/photos` - Upload a new photo
- `PUT /api/photos/{id}` - Update photo metadata
- `DELETE /api/photos/{id}` - Delete a photo

### List Endpoints (Protected)

- `GET /api/lists` - Get all non-archived lists
- `GET /api/lists/shared` - Get shared lists
- `GET /api/lists/{id}` - Get a specific list
- `POST /api/lists` - Create a new list
- `PUT /api/lists/{id}` - Update a list
- `PUT /api/lists/{id}/archive` - Archive a list
- `DELETE /api/lists/{id}` - Delete a list
- `GET /api/lists/{listId}/items` - Get items in a list
- `POST /api/lists/items` - Create a list item
- `PUT /api/lists/items/{id}` - Update a list item
- `DELETE /api/lists/items/{id}` - Delete a list item

### Dashboard Endpoints (Protected)

- `GET /api/dashboard/metrics` - Get system-wide metrics
- `GET /api/dashboard/metrics/user/{userId}` - Get user-specific metrics

All protected endpoints require the `Authorization` header with JWT token:
```
Authorization: Bearer <your-jwt-token>
```

## Configuration

### Environment Variables

Configuration is managed through environment files and Spring profiles. See `.env.example` for all available options.

**Key Configuration:**

```bash
# Database
DB_HOST=localhost
DB_NAME=aboveskycalendar
DB_USER=admin
DB_PASSWORD=your-password

# Email (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Application
SPRING_PROFILES_ACTIVE=local  # local, stage, or prod
JWT_SECRET=your-secret-key
```

### Backend Configuration

Configuration is split across multiple profile-specific files:

- `application.yml` - Base configuration
- `application-local.yml` - Local development (H2, MailHog, debug logging)
- `application-stage.yml` - Staging (PostgreSQL, real SMTP, info logging)
- `application-prod.yml` - Production (PostgreSQL, optimized settings, warn logging)

### Frontend Configuration

Environment-specific configuration files:
- `.env.local` - Local development
- `.env.stage` - Staging environment
- `.env.prod` - Production environment

Edit `frontend/proxy.conf.json` to configure the backend API URL for development:
```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

## 📧 Email Integration

The application includes a comprehensive email system with template support:

### Email Features

1. **OTP (One-Time Password)**
   - 6-digit verification codes
   - 10-minute expiration
   - Secure generation and validation

2. **Password Reset**
   - Secure token-based reset links
   - 1-hour expiration
   - Email verification

3. **Welcome Emails**
   - Automatic on user registration
   - Branded templates
   - Getting started information

4. **Marketing Emails**
   - Newsletter support
   - Unsubscribe functionality
   - Custom HTML templates

### Email Testing (Local Development)

MailHog is included for local email testing:
- **SMTP Server:** localhost:1025
- **Web Interface:** http://localhost:8025
- All emails are captured and viewable in the web UI

### Email Service Usage

```java
@Autowired
private EmailService emailService;

// Send OTP
emailService.sendOtpEmail("user@example.com", "John");

// Send password reset
emailService.sendPasswordResetEmail("user@example.com", "John", "https://yourapp.com");

// Send welcome email
emailService.sendWelcomeEmail("user@example.com", "John");
```

### Email Templates

Templates are located in `backend/src/main/resources/templates/`:
- `otp-email.html` - OTP verification email
- `password-reset-email.html` - Password reset email
- `welcome-email.html` - Welcome email for new users
- `marketing-email.html` - Marketing/newsletter template

All templates use Thymeleaf and are fully customizable.

## 📊 Monitoring and Logging

### ELK Stack Integration

The application integrates with the ELK (Elasticsearch, Logstash, Kibana) stack for centralized logging:

- **Elasticsearch:** Stores and indexes logs
- **Logstash:** Processes and forwards logs
- **Kibana:** Visualizes logs with dashboards

**Access Kibana:** http://localhost:5601

### Structured Logging

Logs are structured in JSON format with:
- Timestamp
- Log level (DEBUG, INFO, WARN, ERROR)
- Logger name
- Message
- Thread information
- MDC context (trace IDs, etc.)

### Log Levels by Environment

- **Local:** DEBUG level, console output
- **Stage:** INFO level, console + file + ELK
- **Production:** WARN level, file + ELK only

### Health Checks

Spring Boot Actuator provides health checks:

```bash
# Overall health
curl http://localhost:8080/actuator/health

# Detailed health (requires authorization)
curl http://localhost:8080/actuator/health -H "Authorization: Bearer <token>"

# Metrics
curl http://localhost:8080/actuator/metrics
```

## Building for Production

### With Docker (Recommended)

```bash
# Build and start production environment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Or use a specific environment
docker-compose -f docker-compose.yml -f docker-compose.stage.yml up -d --build
```

The Docker build uses multi-stage builds for optimized images:
- **Backend:** Maven build → JRE runtime (Alpine Linux)
- **Frontend:** Node build → Nginx serving static files (Alpine Linux)

### Manual Build

#### Backend

```bash
cd backend
mvn clean package -DskipTests
java -jar target/calendar-0.0.1-SNAPSHOT.jar
```

#### Frontend

```bash
cd frontend
npm run build -- --configuration production
```

The build artifacts will be in the `frontend/dist/` directory.

### Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive deployment instructions including:
- Server setup and configuration
- SSL/TLS certificate installation
- Database migration strategies
- Backup and recovery procedures
- Monitoring and maintenance

## Testing

### Backend Tests

```bash
cd backend
mvn test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Security Features

- **Password Hashing**: BCrypt algorithm for secure password storage
- **JWT Authentication**: Stateless authentication with JSON Web Tokens (0.12.3)
- **CORS Protection**: Configured to only allow requests from trusted origins
- **SQL Injection Prevention**: JPA/Hibernate parameterized queries
- **XSS Protection**: Angular's built-in sanitization
- **Security Headers**: Nginx configured with X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- **Environment Isolation**: Separate configurations for local/stage/prod
- **Secrets Management**: Environment variables for sensitive data

### Security Best Practices

1. **Change default passwords** in `.env` file
2. **Generate strong JWT secret** (at least 64 characters)
3. **Use HTTPS in production** with valid SSL certificates
4. **Enable firewall** and limit exposed ports
5. **Regular security updates** for all dependencies
6. **Monitor logs** for suspicious activity
7. **Backup database regularly**

## Troubleshooting

### Docker Issues

#### Containers won't start
```bash
# Check logs
docker-compose logs [service-name]

# Check status
docker-compose ps

# Rebuild containers
docker-compose up -d --build
```

#### Port conflicts
```bash
# Find process using port
sudo lsof -i :8080

# Stop all containers
./scripts/stop-all.sh

# Or modify port in docker-compose.yml
```

#### Out of memory
```bash
# Check Docker stats
docker stats

# Increase Docker Desktop memory limit
# Settings → Resources → Memory → 4GB+

# Or add resource limits to docker-compose.prod.yml
```

### Backend Issues

- **Port 8080 already in use**: Check Docker containers or change `server.port` in application.yml
- **Database connection errors**: 
  - Verify `.env` configuration
  - Check if PostgreSQL container is running: `docker-compose ps db`
  - Check database logs: `docker-compose logs db`
- **JWT errors**: Ensure JWT_SECRET is set in `.env` and is at least 256 bits (32+ characters)
- **Email not sending**: 
  - Local: Check MailHog at http://localhost:8025
  - Stage/Prod: Verify MAIL_* variables in `.env`

### Frontend Issues

- **Cannot connect to backend**: 
  - Verify backend is running: `curl http://localhost:8080/actuator/health`
  - Check proxy configuration in `proxy.conf.json`
- **CORS errors**: Check CORS configuration in `application-*.yml`
- **Module not found**: Run `npm install` to install dependencies
- **Build errors**: 
  - Delete `node_modules` and `package-lock.json`
  - Run `npm install` again
  - Ensure Node.js 18+ is installed

### ELK Stack Issues

#### Elasticsearch won't start
```bash
# Increase vm.max_map_count (Linux)
sudo sysctl -w vm.max_map_count=262144

# Make permanent
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf

# Restart Elasticsearch
docker-compose restart elasticsearch
```

#### Logs not appearing in Kibana
1. Check Logstash is running: `docker-compose ps logstash`
2. Check Logstash logs: `docker-compose logs logstash`
3. Verify backend is using correct profile (stage/prod)
4. Create index pattern in Kibana: `above-sky-calendar-*`

### Getting Help

1. **Check logs**: `./scripts/logs.sh [service] -f`
2. **Review documentation**: [DEPLOYMENT.md](DEPLOYMENT.md)
3. **Check Docker status**: `docker-compose ps`
4. **GitHub Issues**: https://github.com/Coenni/above-sky-calendar/issues
5. **Health checks**: `curl http://localhost:8080/actuator/health`

## Implementation Status

### ✅ Completed Components

#### Backend (Spring Boot)
- **Core Data Models**: All 8 entities created and configured
  - User (enhanced with family features)
  - Event (enhanced with categories, recurring patterns, colors)
  - Task
  - Reward & RewardRedemption
  - Meal
  - Photo
  - FamilyList & ListItem

- **Repositories**: All JPA repositories with custom query methods
- **Services**: Complete business logic for all features
  - TaskService with reward points integration
  - RewardService with redemption workflow
  - MealService with weekly planning
  - PhotoService with file management
  - ListService with item management
  
- **REST Controllers**: Full CRUD APIs for all features
  - TaskController
  - RewardController
  - MealController
  - PhotoController
  - ListController
  - DashboardController with metrics

#### Frontend (Angular)
- **Models**: TypeScript interfaces for all entities
- **Services**: HTTP services for all API endpoints
- **Components**: 
  - Tasks component with full CRUD UI ✓
  - Dashboard with navigation ✓
  - Login & Register ✓
  - Metrics component ✓

### 🚧 In Progress / Next Steps

#### High Priority
1. **Rewards Component**: Create UI for reward catalog and redemption
2. **Meals Component**: Build weekly meal planner interface
3. **Photo Gallery Component**: Implement photo upload and gallery views
4. **Lists Component**: Create list management UI with check-off functionality
5. **Enhanced Calendar View**: Add monthly/weekly views, recurring events UI
6. **Family Member Management**: User profile editing with colors and roles

#### Medium Priority
7. **Dashboard Enhancement**: Add widgets showing metrics from all features
8. **Navigation Menu**: Create sidebar or top menu with icons for all sections
9. **Search & Filters**: Global search across all entities
10. **Notifications**: Real-time notifications for task assignments, reminders
11. **Dark Mode**: Theme toggle functionality
12. **Drag & Drop**: For task reordering and calendar event management

#### Future Enhancements
- **File Upload**: Actual file handling for photos and meal images
- **Email Notifications**: Integration with email service
- **Calendar Sync**: Import/export to Google Calendar, iCal
- **Mobile App**: React Native or Flutter companion app
- **Weather Integration**: Show weather on calendar days
- **Voice Commands**: Integration with voice assistants
- **Data Export**: CSV/PDF export for all data types
- **Multi-language Support**: Internationalization (i18n)
- **Offline Mode**: Progressive Web App (PWA) with offline sync

### 📊 Feature Completeness

| Feature | Backend | Frontend | Status |
|---------|---------|----------|--------|
| Authentication | 100% | 100% | ✅ Complete |
| Calendar/Events | 90% | 60% | 🟡 Partial |
| Tasks | 100% | 80% | 🟢 Mostly Complete |
| Rewards | 100% | 0% | 🔴 Backend Only |
| Meals | 100% | 0% | 🔴 Backend Only |
| Photos | 100% | 0% | 🔴 Backend Only |
| Lists | 100% | 0% | 🔴 Backend Only |
| Dashboard | 100% | 40% | 🟡 Partial |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.