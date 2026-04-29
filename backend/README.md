# PACKORA Backend

This is the backend for the PACKORA web application. It provides secure REST APIs for the frontend, utilizing Spring Boot and Spring Security for authentication and authorization.

## Technologies Used
- **Java 21**
- **Spring Boot 3.4.x**
- **Spring Security & JWT** (Authentication and Authorization)
- **Spring Data JPA** (Data Access)
- **PostgreSQL** (Database)
- **Lombok** (Boilerplate reduction)

## Architecture & Security Implementation
The codebase is structured using a `Controller-Service-Repository` pattern.
- **Authentication:** Users can register and log in via the `AuthController`. 
- **JWT:** Upon successful login, the server generates a JSON Web Token (JWT) that the client must include in the `Authorization` header (`Bearer <token>`) for subsequent requests.
- **Authorization:** Protected routes are filtered through `JwtAuthFilter`. The token is parsed and validated, and the user's details are stored in the Spring Security context.
- **Database:** User credentials and roles are persisted in the PostgreSQL database using JPA Entities (`User`, `Role`).

## Walkthrough: Initialization & Database Connection

To run this application locally and connect everything correctly, follow these steps:

### 1. Database Setup
1. Ensure **PostgreSQL** is installed and running on your local machine.
2. Open **pgAdmin** (or your preferred SQL client) and create a new database named `packora`.
3. The application will automatically construct the necessary tables based on the JPA `@Entity` classes (because of the `spring.jpa.hibernate.ddl-auto=update` property).

### 2. Configure application.properties
Navigate to `src/main/resources/application.properties` and verify your database credentials. 
Update the `username` and `password` to match your local PostgreSQL setup:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/packora
spring.datasource.username=postgres
spring.datasource.password=YourLocalPassword
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

### 3. JWT Configuration (Optional)
Currently, the JWT secret key is generated automatically on server startup. To persist sessions across server restarts in a production environment, you should replace the auto-generated key with a static environment variable in `JwtUtil.java`.

### 4. Running the Application
From the `backend` directory, run the application using the Maven wrapper:
```bash
./mvnw spring-boot:run
```
The server will start on `http://localhost:8080`.

### 5. Testing the Auth Flow
You can test the connectivity and responsiveness using tools like Postman or cURL:
1. **Register:** Send a `POST` request to `/api/auth/register` with a JSON body containing user details.
2. **Login:** Send a `POST` request to `/api/auth/login`. On success, you'll receive a JWT token.
3. **Protected Endpoints:** Include the `Authorization: Bearer <token>` header in your requests to access protected resources.
