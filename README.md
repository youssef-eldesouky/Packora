# Packora📦

 Revolutionizing the way businesses manage packaging, products, and shipping!
 **Packora** is a comprehensive, full-stack B2B e-commerce platform designed to seamlessly connect business owners with top-tier packaging options, unique product designs, and integrated shipping functionalities.


## 📖 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Database Schema & Models](#-database-schema--models)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Contributing](#-contributing)
- [License](#-license)



## Features
- **Multi-Role User Architecture:** Specifically designed portals for *Business Owners*, *Admins*, *Support Staff*, and general *Users*.
- **Advanced Order Management:** Streamlined tracking for products, complete with detailed payment logs.
- **Custom Packaging & Designs:** A dedicated catalogue connecting businesses with *Packaging Partners* and managing custom *Designs*.
- **Integrated Shipping Solutions:** Efficient tracking and alignment with *Shipping Partners* to orchestrate reliable delivery routes.
- **Robust RESTful backend:** Powered by Spring Boot 3/4 with secure internal JPA bindings.
- **Dynamic Frontend:** Fast, responsive UI powered by the latest React ecosystem.


## Tech Stack

### Frontend
- **Framework:** React 19 + React Router 7
- **Styling / Icons:** Lucide-React
- **State/Form Management:** React Hook Form
- **API Calls:** Axios

### Backend
- **Framework:** Spring Boot (Java 17)
- **Data Persistence:** Spring Data JPA / Hibernate
- **Database:** PostgreSQL
- **Build Tool:** Maven
- **Boilerplate Reduction:** Lombok


## Project Architecture

This repository adopts a monorepo approach, cleanly separating the frontend and backend ecosystems while maintaining them tightly within the same version control context:

```text
Packora/
├── backend/            # Spring Boot REST API
│   ├── src/main/java   # Backend Controllers, Services, Models, and Repositories
│   └── pom.xml         # Maven configuration and dependencies
├── public/             # Static web assets
├── src/                # React Frontend Source Code
└── package.json        # Frontend Dependencies and Scripts
```



## Database Schema & Models

Packora’s relational database is meticulously designed utilizing a code-first approach with JPA entities. Key entities include:

- **Authentication & Roles:** `User`, `BusinessOwner`, `Admin`, `SupportStaff`
- **Core Operations:** `Order`, `Product`, `Payment`
- **Design & Logistics:** `Packaging`, `Design`, `OrderPackaging`
- **Partnerships:** `PartnerPackaging`, `PartnerShipping`, `Shipment`


## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
- **Java 17** or higher 
- **Node.js** (v16+) and **npm**
- **PostgreSQL** installed and running on your device
- **Maven** (optional, wrapped within the project as `mvnw`)

### Backend Setup

1. **Navigate to the core backend:**
   ```bash
   cd backend
   ```
2. **Configure your Database:**
   Update the `src/main/resources/application.properties` (or `.yml`) file with your local PostgreSQL credentials:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/packora
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   spring.jpa.hibernate.ddl-auto=update
   ```
3. **Run the Spring Boot application:**
   ```bash
   # On Windows
   .\mvnw spring-boot:run
   
   # On Mac/Linux
   ./mvnw spring-boot:run
   ```
   *The backend will typically start on `http://localhost:8080`.*

### Frontend Setup

1. **Navigate back to the project root:**
   ```bash
   cd ..
   ```
2. **Install the node dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm start
   ```
   *The React application will automatically open in your default browser at `http://localhost:3000`.*
