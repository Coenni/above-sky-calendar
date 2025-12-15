# API-First Development Guide

This project uses an **API-First approach** with OpenAPI 3.0 specification to ensure consistent contracts between frontend and backend.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [Working with the OpenAPI Specification](#working-with-the-openapi-specification)
5. [Backend Development](#backend-development)
6. [Frontend Development](#frontend-development)
7. [Adding New Endpoints](#adding-new-endpoints)
8. [Build Process](#build-process)
9. [Testing](#testing)
10. [Best Practices](#best-practices)

## Overview

### What is API-First?

API-First development means defining your API contract (the `spec.yaml` file) before implementing the backend or frontend code. This approach ensures:

- **Consistent contracts** between frontend and backend
- **Parallel development** - frontend and backend teams can work independently
- **Automatic code generation** - reduces boilerplate and human error
- **Living documentation** - the spec is always up-to-date
- **Contract testing** - ensures implementations match the specification

### Benefits

- ✅ **Type safety** - Generated TypeScript models and Java interfaces
- ✅ **Reduced bugs** - Compile-time checking of API usage
- ✅ **Better collaboration** - Clear API contract for all team members
- ✅ **Auto-generated documentation** - Swagger UI available out of the box
- ✅ **Validation** - Request/response validation based on spec

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         spec.yaml                                │
│              (Single Source of Truth)                            │
└──────────────────┬────────────────────────────┬─────────────────┘
                   │                            │
         ┌─────────▼──────────┐      ┌─────────▼──────────┐
         │  Backend Generator │      │ Frontend Generator │
         │  (Maven Plugin)    │      │ (npm script)       │
         └─────────┬──────────┘      └─────────┬──────────┘
                   │                            │
         ┌─────────▼──────────┐      ┌─────────▼──────────┐
         │  Java Interfaces   │      │ TypeScript APIs    │
         │  & Models          │      │ & Models           │
         └─────────┬──────────┘      └─────────┬──────────┘
                   │                            │
         ┌─────────▼──────────┐      ┌─────────▼──────────┐
         │  Controller Impls  │      │  Service Layer     │
         │  (Your Code)       │      │  (Your Code)       │
         └────────────────────┘      └────────────────────┘
```

## Getting Started

### Prerequisites

- Java 17+
- Maven 3.6+
- Node.js 18+
- npm 9+

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Coenni/above-sky-calendar.git
   cd above-sky-calendar
   ```

2. **Generate backend API code**
   ```bash
   cd backend
   mvn clean generate-sources
   ```

3. **Generate frontend API code**
   ```bash
   cd frontend
   npm install
   npm run generate-api
   ```

4. **Build the backend**
   ```bash
   cd backend
   mvn clean install
   ```

5. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

## Working with the OpenAPI Specification

### File Location

The OpenAPI specification is located at: `spec.yaml` (root directory)

### Viewing the API Documentation

Once the backend is running, you can view the interactive API documentation at:

- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8080/v3/api-docs`

### Spec Structure

```yaml
openapi: 3.0.3
info:           # API metadata
servers:        # Server URLs (dev, prod, etc.)
tags:           # API groupings
paths:          # All API endpoints
  /api/events:
    get:        # Endpoint definition
    post:
components:     # Reusable schemas
  schemas:      # Data models
  securitySchemes: # Authentication
```

### Key Sections

1. **Paths** - Define all API endpoints
2. **Components/Schemas** - Define data models
3. **Security** - Define authentication schemes
4. **Tags** - Group related endpoints

## Backend Development

### Generated Code Structure

```
backend/target/generated-sources/openapi/src/main/java/
└── com/abovesky/calendar/
    ├── api/
    │   ├── AuthApi.java
    │   ├── EventsApi.java
    │   ├── TasksApi.java
    │   ├── RewardsApi.java
    │   ├── MealsApi.java
    │   ├── PhotosApi.java
    │   ├── ListsApi.java
    │   └── MembersApi.java
    └── api/model/
        ├── Event.java
        ├── EventInput.java
        ├── Task.java
        ├── Reward.java
        └── ... (all DTOs)
```

### Implementing a Controller

Controllers must implement the generated API interfaces:

```java
package com.abovesky.calendar.controller;

import com.abovesky.calendar.api.EventsApi;
import com.abovesky.calendar.api.model.Event;
import com.abovesky.calendar.api.model.EventInput;
import com.abovesky.calendar.api.model.GetEvents200Response;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class EventController implements EventsApi {

    private final EventService eventService;

    @Override
    public ResponseEntity<GetEvents200Response> getEvents(
            OffsetDateTime startDate,
            OffsetDateTime endDate,
            Long memberId,
            String category,
            Integer page,
            Integer size
    ) {
        // Your implementation here
        GetEvents200Response response = eventService.getEvents(startDate, endDate, memberId, category, page, size);
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<Event> createEvent(EventInput eventInput) {
        Event created = eventService.createEvent(eventInput);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Override
    public ResponseEntity<Event> getEventById(Long id) {
        Event event = eventService.getEventById(id);
        return ResponseEntity.ok(event);
    }

    @Override
    public ResponseEntity<Event> updateEvent(Long id, EventInput eventInput) {
        Event updated = eventService.updateEvent(id, eventInput);
        return ResponseEntity.ok(updated);
    }

    @Override
    public ResponseEntity<Void> deleteEvent(Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<List<Event>> getRecurringEvents() {
        List<Event> events = eventService.getRecurringEvents();
        return ResponseEntity.ok(events);
    }
}
```

### Converting Between Generated Models and Entities

You'll typically need to convert between:
- **Generated API models** (e.g., `com.abovesky.calendar.api.model.Event`)
- **JPA entities** (e.g., `com.abovesky.calendar.entity.Event`)

Create mapper/converter classes:

```java
@Component
public class EventMapper {
    
    public com.abovesky.calendar.api.model.Event toApi(com.abovesky.calendar.entity.Event entity) {
        if (entity == null) return null;
        
        var apiModel = new com.abovesky.calendar.api.model.Event();
        apiModel.setId(entity.getId());
        apiModel.setTitle(entity.getTitle());
        apiModel.setDescription(entity.getDescription());
        // ... map all fields
        return apiModel;
    }
    
    public com.abovesky.calendar.entity.Event toEntity(com.abovesky.calendar.api.model.EventInput input) {
        if (input == null) return null;
        
        var entity = new com.abovesky.calendar.entity.Event();
        entity.setTitle(input.getTitle());
        entity.setDescription(input.getDescription());
        // ... map all fields
        return entity;
    }
}
```

### Regenerating Backend Code

Whenever `spec.yaml` changes:

```bash
cd backend
mvn clean generate-sources
```

This is automatically run during `mvn compile` and `mvn package`.

## Frontend Development

### Generated Code Structure

```
frontend/src/generated/
├── api/
│   ├── auth-api.ts
│   ├── events-api.ts
│   ├── tasks-api.ts
│   ├── rewards-api.ts
│   ├── meals-api.ts
│   ├── photos-api.ts
│   ├── lists-api.ts
│   └── members-api.ts
├── models/
│   ├── event.ts
│   ├── event-input.ts
│   ├── task.ts
│   ├── reward.ts
│   └── ... (all models)
├── base.ts
├── common.ts
├── configuration.ts
└── index.ts
```

### Using Generated APIs in Services

Create Angular services that wrap the generated APIs:

```typescript
import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { EventsApi, Event, EventInput } from '../generated';
import { Configuration } from '../generated/configuration';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private eventsApi: EventsApi;

  constructor() {
    // Configure the API with base URL and authentication
    const config = new Configuration({
      basePath: 'http://localhost:8080',
      accessToken: () => this.getAuthToken()
    });
    
    this.eventsApi = new EventsApi(config);
  }

  getEvents(
    startDate?: string,
    endDate?: string,
    memberId?: number,
    category?: string,
    page?: number,
    size?: number
  ): Observable<any> {
    return from(
      this.eventsApi.getEvents(startDate, endDate, memberId, category, page, size)
        .then(response => response.data)
    );
  }

  getEventById(id: number): Observable<Event> {
    return from(
      this.eventsApi.getEventById(id)
        .then(response => response.data)
    );
  }

  createEvent(event: EventInput): Observable<Event> {
    return from(
      this.eventsApi.createEvent(event)
        .then(response => response.data)
    );
  }

  updateEvent(id: number, event: EventInput): Observable<Event> {
    return from(
      this.eventsApi.updateEvent(id, event)
        .then(response => response.data)
    );
  }

  deleteEvent(id: number): Observable<void> {
    return from(
      this.eventsApi.deleteEvent(id)
        .then(() => undefined)
    );
  }

  private getAuthToken(): string {
    // Get token from localStorage or auth service
    return localStorage.getItem('authToken') || '';
  }
}
```

### Configuration Service

Create a central configuration service for all APIs:

```typescript
import { Injectable } from '@angular/core';
import { Configuration } from '../generated/configuration';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private config: Configuration;

  constructor() {
    this.config = new Configuration({
      basePath: 'http://localhost:8080',
      accessToken: () => this.getAuthToken()
    });
  }

  getConfiguration(): Configuration {
    return this.config;
  }

  private getAuthToken(): string {
    return localStorage.getItem('authToken') || '';
  }

  updateAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }
}
```

### Regenerating Frontend Code

Whenever `spec.yaml` changes:

```bash
cd frontend
npm run generate-api
```

## Adding New Endpoints

Follow these steps to add a new API endpoint:

### 1. Update spec.yaml

Add the new endpoint definition:

```yaml
paths:
  /api/notifications:
    get:
      tags:
        - Notifications
      summary: List notifications
      operationId: getNotifications
      parameters:
        - name: unreadOnly
          in: query
          schema:
            type: boolean
      responses:
        '200':
          description: List of notifications
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Notification'
```

Add the schema if it doesn't exist:

```yaml
components:
  schemas:
    Notification:
      type: object
      properties:
        id:
          type: integer
          format: int64
        message:
          type: string
        read:
          type: boolean
        createdAt:
          type: string
          format: date-time
```

### 2. Regenerate Backend Code

```bash
cd backend
mvn clean generate-sources
```

This generates `NotificationsApi.java` interface.

### 3. Implement Backend Controller

```java
@RestController
@RequiredArgsConstructor
public class NotificationController implements NotificationsApi {
    
    private final NotificationService notificationService;
    
    @Override
    public ResponseEntity<List<Notification>> getNotifications(Boolean unreadOnly) {
        List<Notification> notifications = notificationService.getNotifications(unreadOnly);
        return ResponseEntity.ok(notifications);
    }
}
```

### 4. Regenerate Frontend Code

```bash
cd frontend
npm run generate-api
```

This generates `notifications-api.ts`.

### 5. Use in Frontend

```typescript
import { NotificationsApi, Notification } from '../generated';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private api: NotificationsApi;
  
  constructor() {
    this.api = new NotificationsApi(this.getConfig());
  }
  
  getNotifications(unreadOnly?: boolean): Observable<Notification[]> {
    return from(
      this.api.getNotifications(unreadOnly)
        .then(response => response.data)
    );
  }
}
```

### 6. Test

Write tests for both backend and frontend implementations.

## Build Process

### Complete Build

To build everything from scratch:

```bash
# Generate and build backend
cd backend
mvn clean install

# Generate and build frontend
cd ../frontend
npm install
npm run generate-api
npm run build
```

### CI/CD Integration

In your CI/CD pipeline (e.g., GitHub Actions):

```yaml
name: Build and Test

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Validate OpenAPI Spec
        run: |
          npm install -g @apidevtools/swagger-cli
          swagger-cli validate spec.yaml
      
      - name: Build Backend
        run: |
          cd backend
          mvn clean install
      
      - name: Build Frontend
        run: |
          cd frontend
          npm install
          npm run generate-api
          npm run build
```

## Testing

### Validate OpenAPI Spec

Install swagger-cli globally:

```bash
npm install -g @apidevtools/swagger-cli
```

Validate the spec:

```bash
swagger-cli validate spec.yaml
```

### Backend Contract Testing

Use Spring's MockMvc to test that controllers match the spec:

```java
@WebMvcTest(EventController.class)
class EventControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private EventService eventService;
    
    @Test
    void createEvent_shouldReturn201() throws Exception {
        EventInput input = new EventInput()
            .title("Test Event")
            .startDate(OffsetDateTime.now())
            .endDate(OffsetDateTime.now().plusHours(1));
        
        Event expected = new Event()
            .id(1L)
            .title("Test Event");
        
        when(eventService.createEvent(any())).thenReturn(expected);
        
        mockMvc.perform(post("/api/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(input)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.title").value("Test Event"));
    }
}
```

### Frontend Integration Testing

Test that frontend services correctly use the generated APIs:

```typescript
describe('EventService', () => {
  let service: EventService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EventService]
    });
    service = TestBed.inject(EventService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create event', (done) => {
    const mockEvent: Event = {
      id: 1,
      title: 'Test Event',
      // ... other fields
    };

    service.createEvent({
      title: 'Test Event',
      startDate: '2024-06-15T10:00:00Z',
      endDate: '2024-06-15T11:00:00Z'
    }).subscribe(event => {
      expect(event.id).toBe(1);
      expect(event.title).toBe('Test Event');
      done();
    });

    const req = httpMock.expectOne('http://localhost:8080/api/events');
    expect(req.request.method).toBe('POST');
    req.flush(mockEvent);
  });
});
```

## Best Practices

### 1. Spec-First Always

- **Always** update `spec.yaml` first before writing any code
- Review spec changes in pull requests
- Keep the spec in sync with implementation

### 2. Use Descriptive Names

- Use clear, meaningful operation IDs (e.g., `createEvent`, not `postEvent`)
- Use consistent naming conventions across endpoints
- Add detailed descriptions to all fields

### 3. Version Your API

Consider adding versioning to your spec:

```yaml
servers:
  - url: http://localhost:8080/v1
    description: Version 1 API
```

### 4. Document Everything

- Add descriptions to all endpoints
- Provide examples for request/response bodies
- Document error responses
- Include business logic constraints

### 5. Use References ($ref)

Reuse common components:

```yaml
components:
  schemas:
    # Common response wrapper
    PagedResponse:
      type: object
      properties:
        content:
          type: array
          items: {}
        pagination:
          $ref: '#/components/schemas/PaginationMetadata'
```

### 6. Validate Input

Define validation rules in the spec:

```yaml
EventInput:
  type: object
  required:
    - title
    - startDate
  properties:
    title:
      type: string
      minLength: 1
      maxLength: 255
    startDate:
      type: string
      format: date-time
```

### 7. Handle Errors Consistently

Define standard error responses:

```yaml
components:
  schemas:
    ErrorResponse:
      type: object
      properties:
        timestamp:
          type: string
          format: date-time
        status:
          type: integer
        error:
          type: string
        message:
          type: string
        path:
          type: string
```

### 8. Keep Generated Code Separate

- Never edit generated code directly
- Keep generated code in separate packages/directories
- Add generated directories to `.gitignore`

### 9. Create Mappers/Converters

Don't use generated models directly in your business logic:

```java
// Good: Use a mapper
Event entity = eventMapper.toEntity(apiModel);
repository.save(entity);

// Bad: Direct usage creates tight coupling
repository.save(apiModel); // Wrong!
```

### 10. Document Changes

When updating the spec, document what changed and why:

```yaml
# Added filtering by category for events (JIRA-123)
# Version: 1.1.0
# Date: 2024-06-15
```

## Troubleshooting

### Backend Generation Fails

**Problem**: Maven build fails during code generation

**Solutions**:
- Check `spec.yaml` syntax with `swagger-cli validate spec.yaml`
- Ensure all `$ref` references are valid
- Check for duplicate `operationId` values
- Verify Maven plugin version compatibility

### Frontend Generation Fails

**Problem**: npm run generate-api fails

**Solutions**:
- Check Node.js and npm versions
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check `spec.yaml` is in the correct location relative to frontend directory

### Type Mismatches

**Problem**: TypeScript compilation errors after generation

**Solutions**:
- Ensure `spec.yaml` types are correct (string, integer, boolean, etc.)
- Check date formats (use `date-time` for timestamps, `date` for dates)
- Regenerate code after spec changes
- Check TypeScript version compatibility

### Authentication Issues

**Problem**: 401 errors when calling APIs

**Solutions**:
- Verify JWT token is being sent correctly
- Check token expiration
- Ensure `bearerAuth` is configured in the spec
- Add proper authentication headers in frontend configuration

## Resources

- [OpenAPI Specification 3.0](https://swagger.io/specification/)
- [OpenAPI Generator Documentation](https://openapi-generator.tech/)
- [Spring Boot OpenAPI](https://springdoc.org/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)

## Getting Help

If you have questions or run into issues:

1. Check this guide and the [OpenAPI specification](https://swagger.io/specification/)
2. Review existing endpoints in `spec.yaml` for examples
3. Check the generated code to understand the expected structure
4. Ask the team in the project chat or create an issue

## Conclusion

The API-First approach ensures consistency, reduces bugs, and improves collaboration. By following this guide, you can confidently work with the OpenAPI specification and generated code to build robust, type-safe applications.

Happy coding! 🚀
