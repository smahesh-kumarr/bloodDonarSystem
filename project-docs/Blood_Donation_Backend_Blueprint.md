# 🩸 Blood Donation & Donor Matching System (Redora)

## Backend Architecture & Implementation Blueprint

**Generated on:** 25 February 2026

---

# 1️⃣ System Requirements

## 1.1 Functional Requirements

- User registration and secure login (JWT-based authentication)
- Role-based access control (Admin / Donor / User)
- Logout functionality
- Password reset functionality
- Donor profile creation and update
- Set donor availability status
- Search donors by blood group
- Filter donors by nearby location (Geospatial search)
- Create blood request
- Accept / Reject / Complete blood request
- View request history
- Admin can manage users and donor data
- Admin can verify emergency requests
- Hospital registration and profile management
- Hospitals can create and manage blood donation camps (campaigns)
- Users and donors can view and register for upcoming blood donation camps
---

## 1.2 Production-Ready Enhancements

- Account status (Active / Blocked)
- Last donation date tracking
- Minimum 3-month donation gap validation
- Emergency flag in request
- Pagination for donor search results
- Request expiration time
- Audit timestamps (`createdAt`, `updatedAt`)
- Soft delete mechanism

---

## 1.3 Non-Functional Requirements

- Secure JWT authentication
- Password hashing using bcrypt
- Input data validation
- Rate limiting for API protection
- Centralized logging
- API versioning (`/api/v1/`)
- Container-ready architecture (Docker)
- Scalable microservices architecture

---

# 2️⃣ Database Design

## 2.1 Users Collection

```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String",
  "password": "String (hashed)",
  "role": "admin | donor | user | hospital",
  "isActive": "Boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## 2.2 Donors Collection

```json
{
  "_id": "ObjectId",
  "userId": "Reference to Users",
  "bloodGroup": "A+ | A- | B+ | O+ | etc",
  "phone": "String",
  "location": {
    "type": "Point",
    "coordinates": ["longitude", "latitude"]
  },
  "availability": "Boolean",
  "lastDonationDate": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

> ⚠️ A `2dsphere` index is required for the location field.

---

## 2.3 Requests Collection

```json
{
  "_id": "ObjectId",
  "requesterId": "Reference to Users",
  "donorId": "Reference to Donors",
  "bloodGroup": "String",
  "hospitalName": "String",
  "location": "String",
  "status": "pending | accepted | rejected | completed",
  "emergency": "Boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## 2.4 Notifications Collection

```json
{
  "_id": "ObjectId",
  "userId": "Reference to Users",
  "message": "String",
  "type": "email | sms",
  "status": "sent | failed",
  "createdAt": "Date"
}
```

---

## 2.5 Hospitals Collection

```json
{
  "_id": "ObjectId",
  "name": "String",
  "userId": "Reference to Users",
  "location": {
    "type": "Point",
    "coordinates": ["longitude", "latitude"]
  },
  "contactPhone": "String",
  "verificationStatus": "pending | verified | rejected",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## 2.6 Campaigns (Blood Camps) Collection

```json
{
  "_id": "ObjectId",
  "hospitalId": "Reference to Hospitals",
  "title": "String",
  "description": "String",
  "date": "Date",
  "startTime": "String",
  "endTime": "String",
  "location": "String",
  "status": "upcoming | completed | cancelled",
  "registeredDonors": ["Reference to Users"],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

# 3️⃣ Required API Endpoints

## 3.1 Auth Service (Port 5001)

- POST `/api/v1/auth/register`
- POST `/api/v1/auth/login`
- GET `/api/v1/auth/me`
- PATCH `/api/v1/auth/update-password`

---

## 3.2 Donor Service (Port 5002)

- POST `/api/v1/donors`
- PATCH `/api/v1/donors/:id`
- PATCH `/api/v1/donors/availability`
- GET `/api/v1/donors`
- GET `/api/v1/donors/search?bloodGroup=A+`
- GET `/api/v1/donors/nearby?lat=..&lng=..`

---

## 3.3 Request Service (Port 5003)

- POST `/api/v1/requests`
- GET `/api/v1/requests`
- PATCH `/api/v1/requests/:id/accept`
- PATCH `/api/v1/requests/:id/reject`
- PATCH `/api/v1/requests/:id/complete`

---

## 3.4 Admin Endpoints

- GET `/api/v1/admin/users`
- PATCH `/api/v1/admin/block/:id`
- DELETE `/api/v1/admin/user/:id`
- GET `/api/v1/admin/requests`

---

## 3.5 Hospital Service (Port 5004)

- POST `/api/v1/hospitals`
- GET `/api/v1/hospitals`
- GET `/api/v1/hospitals/:id`
- POST `/api/v1/campaigns`
- GET `/api/v1/campaigns`
- PATCH `/api/v1/campaigns/:id`
- POST `/api/v1/campaigns/:id/register`

---

# 4️⃣ Middleware Architecture

- `protect` → JWT verification and user extraction\
- `restrictTo(...roles)` → Role-based access control\
- `errorHandler` → Centralized error handling\
- `validateRequest` → Request body validation\
- `rateLimiter` → Prevent API abuse

---

# 5️⃣ Microservice JWT Strategy

- Auth Service issues JWT token.
- Other services verify JWT using shared secret.
- No inter-service authentication calls required.
- Each service validates token independently.

---

# 6️⃣ System Architecture Flow

1.  User logs in and receives JWT token.
2.  Frontend stores the token.
3.  Token is sent in Authorization header for protected routes.
4.  Microservices validate the token.
5.  Business logic is executed.
6.  Data is stored in MongoDB Atlas.

---
