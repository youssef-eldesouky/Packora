# PACKORA Backend

This is the backend for the PACKORA web application (packaging customization and shipment).

## Technologies Used
- **Java 21**
- **Spring Boot 3.4**
- **Spring Web** (REST APIs)
- **Spring Data JPA** (Prepared)
- **PostgreSQL Driver** (Prepared)
- **Lombok** (Boilerplate reduction)
- **Spring Boot DevTools**

## Project Structure
The code is organized into a clean `Controller-Service-Repository` layered architecture:
- `com.packora.backend.controller`: REST Endpoints exposing APIs to the frontend.
- `com.packora.backend.service`: Business Logic layer.
- `com.packora.backend.dto`: Data Transfer Objects for moving data between layers.
- `com.packora.backend.repository`: Data Access layer (JPA Repositories).
- `com.packora.backend.model`: JPA Entities (Database tables).
- `com.packora.backend.config`: Configuration classes (e.g., CORS setup).

## Running the Application
To run the application locally on your machine, navigate to the `backend` directory and execute:
```bash
./mvnw spring-boot:run
```
By default, the application will start on `http://localhost:8080`.

### Endpoints
The backend currently has a placeholder health check endpoint:
- **`GET /api/status`**
Returns: `{"status": "Packora Backend is running"}`

## Note for the Database Teammate
Currently, database connection code and `@Entity` classes have not been implemented.
To allow the project to start successfully without a database config, Data Source auto-configuration has been temporarily excluded in `src/main/resources/application.properties`.

**When you are ready to implement the database:**
1. Configure your PostgreSQL database connection properties in `src/main/resources/application.properties`.
2. Remove the `spring.autoconfigure.exclude` line from `application.properties`.
3. Start creating your `@Entity` classes in the `model` package and your repositories in the `repository` package.
