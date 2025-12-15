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

## Technology Stack

### Backend
- **Spring Boot 3.2.0** - Java framework for building REST APIs
- **Spring Data JPA** - Data persistence layer
- **Spring Security** - Authentication and authorization
- **JWT 0.12.3** - Token-based authentication
- **H2 Database** - In-memory database for development
- **MySQL** - Production database support
- **Lombok** - Reduce boilerplate code
- **Maven** - Dependency management
- **OpenAPI Generator** - Automatic API code generation
- **SpringDoc OpenAPI** - API documentation (Swagger UI)

### Frontend
- **Angular 17** - Modern web framework with standalone components
- **TypeScript** - Type-safe JavaScript
- **RxJS** - Reactive programming
- **Angular Router** - Navigation and routing
- **HttpClient** - REST API communication
- **Axios** - HTTP client for generated API code
- **OpenAPI Generator** - Automatic TypeScript client generation

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
├── backend/                          # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/abovesky/calendar/
│   │   │   │   ├── api/              # Generated API interfaces (from spec.yaml)
│   │   │   │   ├── config/          # Security & JWT configuration
│   │   │   │   ├── controller/      # REST API endpoint implementations
│   │   │   │   ├── service/         # Business logic
│   │   │   │   ├── repository/      # Database access
│   │   │   │   ├── entity/          # JPA entities
│   │   │   │   └── dto/             # Data transfer objects
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/                    # Unit tests
│   └── pom.xml                      # Maven dependencies + OpenAPI Generator
│
├── frontend/                         # Angular frontend
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
└── README.md                         # This file
```

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

### Backend Configuration (application.properties)

```properties
# Server port
server.port=8080

# Database (H2 for dev, MySQL for prod)
spring.datasource.url=jdbc:h2:mem:calendardb
spring.datasource.username=sa
spring.datasource.password=

# JWT settings
jwt.secret=your-secret-key
jwt.expiration=86400000

# CORS
cors.allowed.origins=http://localhost:4200
```

### Frontend Configuration

Edit `frontend/proxy.conf.json` to configure the backend API URL:
```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

## Building for Production

### Backend

```bash
cd backend
mvn clean package
java -jar target/calendar-0.0.1-SNAPSHOT.jar
```

### Frontend

```bash
cd frontend
npm run build
```

The build artifacts will be in the `frontend/dist/` directory.

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
- **JWT Authentication**: Stateless authentication with JSON Web Tokens
- **CORS Protection**: Configured to only allow requests from trusted origins
- **SQL Injection Prevention**: JPA/Hibernate parameterized queries
- **XSS Protection**: Angular's built-in sanitization

## Troubleshooting

### Backend Issues

- **Port 8080 already in use**: Change `server.port` in application.properties
- **Database connection errors**: Verify H2 configuration or MySQL credentials
- **JWT errors**: Check jwt.secret and jwt.expiration values

### Frontend Issues

- **Cannot connect to backend**: Verify backend is running on port 8080
- **CORS errors**: Check CORS configuration in SecurityConfig.java
- **Module not found**: Run `npm install` to install dependencies

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