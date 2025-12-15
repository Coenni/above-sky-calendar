# Above Sky Calendar

A full-stack calendar application built with Spring Boot (backend) and Angular (frontend).

## Technology Stack

### Backend
- **Spring Boot 3.2.0** - Java framework for building REST APIs
- **Spring Data JPA** - Data persistence layer
- **Spring Security** - Authentication and authorization
- **JWT** - Token-based authentication
- **H2 Database** - In-memory database for development
- **MySQL** - Production database support
- **Lombok** - Reduce boilerplate code
- **Maven** - Dependency management

### Frontend
- **Angular 17** - Modern web framework with standalone components
- **TypeScript** - Type-safe JavaScript
- **RxJS** - Reactive programming
- **Angular Router** - Navigation and routing
- **HttpClient** - REST API communication

## Features

- **User Authentication**: Register and login with JWT-based authentication
- **Event Management**: Create, read, update, and delete calendar events
- **Dashboard**: View all your calendar events in a clean interface
- **Metrics**: Track event statistics (total, upcoming, past, today's events)
- **Responsive Design**: Works on desktop and mobile devices
- **Secure API**: Protected endpoints with JWT authentication

## Project Structure

```
above-sky-calendar/
├── backend/                          # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/abovesky/calendar/
│   │   │   │   ├── config/          # Security & JWT configuration
│   │   │   │   ├── controller/      # REST API endpoints
│   │   │   │   ├── service/         # Business logic
│   │   │   │   ├── repository/      # Database access
│   │   │   │   ├── entity/          # JPA entities
│   │   │   │   └── dto/             # Data transfer objects
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/                    # Unit tests
│   └── pom.xml                      # Maven dependencies
│
├── frontend/                         # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/          # UI components
│   │   │   ├── services/            # API services
│   │   │   ├── guards/              # Route guards
│   │   │   ├── interceptors/        # HTTP interceptors
│   │   │   └── models/              # TypeScript interfaces
│   │   ├── assets/                  # Static assets
│   │   ├── index.html               # Main HTML file
│   │   └── main.ts                  # Application entry point
│   ├── angular.json                 # Angular configuration
│   ├── package.json                 # NPM dependencies
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

2. Install dependencies and build the project:
   ```bash
   mvn clean install
   ```

3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```

   The backend server will start on `http://localhost:8080`

4. (Optional) Access the H2 console:
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

3. Start the development server:
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