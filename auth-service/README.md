# Auth Service

Authentication service for the Blood Donation System.

## Features

- User registration
- User login (JWT)
- Get current user details
- Role-based access control (RBAC)

## API Endpoints

### Auth

- `POST /api/v1/auth/register` - Register a new user
  - Body: `{ name, email, password, role }`
- `POST /api/v1/auth/login` - Login user
  - Body: `{ email, password }`
- `GET /api/v1/auth/me` - Get current user (Protected)
  - Headers: `Authorization: Bearer <token>`

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set environment variables in `.env`:

   ```env
   PORT=5001
   MONGO_URI=mongodb://localhost:27017/blood-donation-auth
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

3. Run the server:

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```
