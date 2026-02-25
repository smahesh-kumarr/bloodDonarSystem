# 🩸 Blood Donation & Donor Matching System

## Project Architecture & Development Roadmap

**Generated on:** 25 February 2026

------------------------------------------------------------------------

# 1️⃣ Project Overview

The **Blood Donation & Donor Matching System** is a microservices-based
MERN application designed to connect blood donors and recipients
efficiently during emergencies.

### 🎯 The system enables:

-   Donor registration and profile management\
-   Blood group and location-based donor search\
-   Blood request creation and tracking\
-   Admin monitoring and management\
-   Secure authentication and authorization

------------------------------------------------------------------------

# 2️⃣ Architecture Overview (Microservices-Based)

## 🌐 Frontend

-   React application\
-   Communicates with backend via REST APIs\
-   Environment-based API configuration

------------------------------------------------------------------------

## 🖥 Backend (Microservices)

1.  **Auth Service** -- Handles login, registration, JWT tokens, role
    management\
2.  **Donor Service** -- Manages donor profile, availability, blood
    group, location\
3.  **Request Service** -- Manages blood request lifecycle (create /
    accept / reject / complete)\
4.  **Notification Service** -- Sends email/SMS alerts (optional
    enhancement)

------------------------------------------------------------------------

## 🗄 Database

-   MongoDB Atlas\
-   Shared database with separated collections

------------------------------------------------------------------------

## ☁ Infrastructure (Future Production)

-   AWS ECS Fargate\
-   Application Load Balancer\
-   S3 + CloudFront (Frontend hosting)\
-   Route53 for DNS\
-   AWS Secrets Manager for environment variables

------------------------------------------------------------------------

# 3️⃣ Development Order (Step-by-Step Process)

## STEP 1 -- Requirement Finalization

-   Confirm all features\
-   Define roles (Admin, Donor, User)\
-   Finalize API endpoints

## STEP 2 -- Database Design

Design collections:

-   `users`
-   `donors`
-   `requests`
-   `notifications`

Define schema structure.

## STEP 3 -- Auth Service (Build First)

-   User registration\
-   Login\
-   JWT generation\
-   Role-based middleware\
-   Token validation

## STEP 4 -- Donor Service

-   Create donor profile\
-   Update availability\
-   Fetch donor list\
-   Filter by blood group/location

## STEP 5 -- Request Service

-   Send blood request\
-   Accept / Reject request\
-   Track request status

## STEP 6 -- Notification Service

-   Email integration (Mailtrap for development)\
-   SMS integration (optional)

## STEP 7 -- API Testing

-   Test all endpoints via Postman\
-   Verify authentication flow

## STEP 8 -- Frontend Development

-   Authentication pages\
-   Donor dashboard\
-   User dashboard\
-   Search and request UI\
-   Connect to backend APIs

## STEP 9 -- Integration Testing

Validate full workflow:

    User → Search → Send Request → Donor Accept → Status Update

## STEP 10 -- Dockerization

-   Create Dockerfile for each service\
-   Setup `docker-compose` for local orchestration

------------------------------------------------------------------------

# 4️⃣ Local Communication Workflow

### 🖥 Ports

-   Frontend → `3000`
-   Auth Service → `5001`
-   Donor Service → `5002`
-   Request Service → `5003`
-   Notification Service → `5004`

### 🔗 REST Communication

    http://localhost:5001/auth
    http://localhost:5002/donor
    http://localhost:5003/request

-   Environment variables manage API URLs\
-   No hardcoded service addresses

------------------------------------------------------------------------

# 5️⃣ Microservices Project Structure

    /blood-donation-system
    │
    ├── auth-service
    │   ├── src
    │   │   ├── controllers
    │   │   ├── models
    │   │   ├── routes
    │   │   ├── middleware
    │   │   └── app.js
    │   ├── Dockerfile
    │   └── package.json
    │
    ├── donor-service
    │   ├── src
    │   │   ├── controllers
    │   │   ├── models
    │   │   ├── routes
    │   │   └── app.js
    │   ├── Dockerfile
    │   └── package.json
    │
    ├── request-service
    │   ├── src
    │   │   ├── controllers
    │   │   ├── models
    │   │   ├── routes
    │   │   └── app.js
    │   ├── Dockerfile
    │   └── package.json
    │
    ├── notification-service
    │   ├── src
    │   │   ├── services
    │   │   └── app.js
    │   ├── Dockerfile
    │   └── package.json
    │
    ├── frontend
    │   ├── src
    │   ├── public
    │   └── package.json
    │
    └── docker-compose.yml

------------------------------------------------------------------------

# 6️⃣ Development Best Practices

-   Backend-first approach\
-   Strict separation of services\
-   Use environment variables everywhere\
-   Avoid service-to-service database dependency\
-   Implement centralized logging\
-   Write modular and scalable code

------------------------------------------------------------------------

# 7️⃣ Future Production Preparation

While developing locally, ensure:

-   Application reads only from `process.env`\
-   Services are stateless\
-   APIs follow REST conventions\
-   Authentication is centralized\
-   Code is container-ready

This ensures smooth transition to ECS deployment later.
