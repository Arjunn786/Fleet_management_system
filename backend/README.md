# Fleet Management Backend API

A comprehensive Node.js + Express + MongoDB + Redis backend for the Fleet Management System.

## Features

- 🔐 JWT Authentication with Access & Refresh Tokens
- 👥 Role-Based Access Control (Customer, Driver, Owner, Admin)
- 🚗 Complete Vehicle Management
- 📅 Booking & Trip Management
- 👨‍✈️ Driver Assignment System
- 📊 Analytics & Insights
- 📧 Email Notifications (Nodemailer)
- ⚡ Redis Caching & Rate Limiting
- 🗄️ MongoDB with Mongoose ODM
- ✅ Input Validation
- 🔒 Security Best Practices (Helmet, CORS)
- 📝 Comprehensive Logging (Winston)
- 🗑️ Soft Delete Support

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **Cache:** Redis
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** express-validator
- **Email:** Nodemailer
- **Security:** Helmet, bcryptjs
- **Logging:** Winston, Morgan

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or connection string)
- Redis (running locally)
- npm or yarn

## Installation

1. **Clone the repository**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   ```

4. **Configure .env file**

   ```env
   PORT=5000
   NODE_ENV=development

   MONGODB_URI=mongodb://localhost:27017/fleet_management

   JWT_ACCESS_SECRET=your-access-secret
   JWT_REFRESH_SECRET=your-refresh-secret
   JWT_ACCESS_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d

   REDIS_HOST=localhost
   REDIS_PORT=6379

   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

5. **Start MongoDB**

   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community

   # Or
   mongod
   ```

6. **Start Redis**

   ```bash
   # On macOS with Homebrew
   brew services start redis

   # Or
   redis-server
   ```

7. **Start the server**

   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password

### Vehicles

- `GET /api/vehicles` - Get all vehicles (with filters)
- `GET /api/vehicles/:id` - Get single vehicle
- `POST /api/vehicles` - Create vehicle (Owner)
- `PUT /api/vehicles/:id` - Update vehicle (Owner)
- `DELETE /api/vehicles/:id` - Delete vehicle (Owner)
- `GET /api/vehicles/my/vehicles` - Get my vehicles (Owner)
- `PATCH /api/vehicles/:id/availability` - Update availability

### Bookings

- `POST /api/bookings` - Create booking (Customer)
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get single booking
- `GET /api/bookings/my/history` - Get my bookings (Customer)
- `PATCH /api/bookings/:id/status` - Update booking status
- `POST /api/bookings/:id/cancel` - Cancel booking

### Trips

- `GET /api/trips` - Get all trips
- `GET /api/trips/:id` - Get single trip
- `PATCH /api/trips/:id/status` - Update trip status (Driver)
- `PATCH /api/trips/:id/assign-driver` - Assign driver (Owner)
- `POST /api/trips/:id/review` - Add trip review
- `POST /api/trips/:id/issues` - Report issue

### Drivers

- `GET /api/drivers/available-vehicles` - Get available vehicles (Driver)
- `POST /api/drivers/register` - Register for vehicle (Driver)
- `GET /api/drivers/my-assignments` - Get my assignments (Driver)
- `GET /api/drivers/assignments` - Get all assignments (Owner)
- `PATCH /api/drivers/assignments/:id/review` - Approve/Reject (Owner)
- `GET /api/drivers` - Get all drivers (Owner/Admin)

### Analytics

- `GET /api/analytics/owner` - Owner dashboard analytics
- `GET /api/analytics/driver` - Driver analytics
- `GET /api/analytics/customer` - Customer analytics

### Admin

- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/:id` - Delete user
- `PATCH /api/admin/users/:id/role` - Update user role
- `GET /api/admin/vehicles` - Get all vehicles
- `DELETE /api/admin/vehicles/:id` - Delete vehicle
- `GET /api/admin/trips` - Get all trips
- `DELETE /api/admin/trips/:id` - Delete trip

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── redis.js             # Redis connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── vehicleController.js
│   │   ├── bookingController.js
│   │   ├── tripController.js
│   │   ├── driverController.js
│   │   ├── adminController.js
│   │   ├── analyticsController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js              # JWT & authorization
│   │   ├── errorHandler.js      # Error handling
│   │   └── rateLimiter.js       # Rate limiting
│   ├── models/
│   │   ├── User.js
│   │   ├── Vehicle.js
│   │   ├── Booking.js
│   │   ├── Trip.js
│   │   └── DriverAssignment.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── vehicleRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── tripRoutes.js
│   │   ├── driverRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── analyticsRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   ├── logger.js            # Winston logger
│   │   ├── tokenHelper.js       # JWT utilities
│   │   ├── emailService.js      # Nodemailer
│   │   └── cacheHelper.js       # Redis caching
│   └── server.js                # Entry point
├── logs/                        # Log files
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Database Schema

### User

- Supports: Customer, Driver, Owner, Admin roles
- Password hashing with bcrypt
- Soft delete support

### Vehicle

- Owner reference
- Availability management
- Location with coordinates
- Soft delete support

### Booking

- Customer & Vehicle references
- Pricing calculation
- Status tracking
- Soft delete support

### Trip

- Linked to Booking
- Driver assignment
- Revenue tracking
- Rating system
- Soft delete support

### DriverAssignment

- Driver-Vehicle relationship
- Approval workflow
- Status management

## Security Features

- Password hashing (bcryptjs)
- JWT access & refresh tokens
- Token blacklisting (Redis)
- Rate limiting (express-rate-limit + Redis)
- CORS configuration
- Helmet security headers
- Input validation (express-validator)
- Role-based access control

## Caching Strategy

Redis is used for:

- API response caching
- Rate limiting
- Token blacklisting
- Performance optimization

## Email Notifications

Automated emails sent for:

- Booking confirmation
- Trip completion
- Trip cancellation

## Error Handling

- Centralized error handling middleware
- Custom AppError class
- Mongoose error handling
- JWT error handling
- Validation error handling

## Logging

- Winston for application logging
- Morgan for HTTP request logging
- Separate error and combined logs
- Console logging in development

## License

MIT
