# Fleet Management System - MERN Stack

A comprehensive fleet management system built with MERN stack for vehicle booking, trip management, and fleet analytics. This system supports multiple user roles (Customer, Driver, Owner, Admin) with dedicated dashboards and full-featured workflows.

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git**
- **Redis** (optional - can be disabled)

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd fleet_management-v2

# Install dependencies for all applications
cd backend && npm install
cd ../user-app && npm install
cd ../admin-portal && npm install
```

### 2. Environment Configuration

#### Backend Setup

```bash
cd backend

# Create .env file
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/fleet_management
JWT_SECRET=your-super-secret-jwt-key-here
REDIS_ENABLED=false
PORT=5000
NODE_ENV=development
EOF
```

#### User Application Setup

```bash
cd user-app

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
```

#### Admin Portal Setup

```bash
cd admin-portal

# Create environment file
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

### 3. Start All Services

Open **3 terminal windows** and run:

```bash
# Terminal 1 - Backend API
cd backend && npm run dev

# Terminal 2 - User Application
cd user-app && npm run dev

# Terminal 3 - Admin Portal
cd admin-portal && npm run dev
```

### 4. Populate Database with Test Data

````bash
cd backend

# Populate comprehensive Indian data (users, vehicles, bookings, trips)
node scripts/populateDummyData.js

### 5. Access Applications

- **🌐 User Application**: http://localhost:3000 (Customer/Driver/Owner portal)
- **🔧 Admin Portal**: http://localhost:3001(Admin dashboard)
- **🔗 Backend API**: http://localhost:5000 (REST API)

> **Note**: Ports may automatically adjust if default ports are in use. Check terminal output for actual URLs.

### 6. Login Credentials

| Role         | Email              | Password    | Dashboard         | Access              |
| ------------ | ------------------ | ----------- | ----------------- | ------------------- |
| **Admin**    | admin@fleet.com    | password123 | Admin Portal      | System management   |
| **Owner 1**  | owner1@fleet.com   | password123 | User App (Owner)  | Fleet management    |
| **Owner 2**  | owner2@fleet.com   | password123 | User App (Owner)  | Fleet management    |
| **Driver 1** | driver1@fleet.com  | password123 | User App (Driver) | Trip management     |
| **Driver 2** | driver2@fleet.com  | password123 | User App (Driver) | Trip management     |
| **Driver 3** | driver3@fleet.com  | password123 | User App (Driver) | Trip management     |
| **Driver 4** | driver4@fleet.com  | password123 | User App (Driver) | Trip management     |
| **Customer 1** | customer1@fleet.com | password123 | User App (Customer) | Vehicle booking   |
| **Customer 2** | customer2@fleet.com | password123 | User App (Customer) | Vehicle booking   |
| **Customer 3** | customer3@fleet.com | password123 | User App (Customer) | Vehicle booking   |
| **Customer 4** | customer4@fleet.com | password123 | User App (Customer) | Vehicle booking   |
| **Customer 5** | customer5@fleet.com | password123 | User App (Customer) | Vehicle booking   |
| **Customer 6** | customer6@fleet.com | password123 | User App (Customer) | Vehicle booking   |

> **Quick Test**: Use `customer1@fleet.com` to test booking flow, `driver1@fleet.com` for trip management, and `owner1@fleet.com` for fleet operations.

---

## 🎮 How to Test the System

### 1. Admin Dashboard Testing

```bash
# Go to http://localhost:5173 (Admin Portal)
1. Login with admin@fleet.com / password123
2. View comprehensive dashboard with Indian fleet data
3. Manage users across multiple Indian cities
4. Monitor vehicles with Indian registration numbers
5. Track bookings and trips across India
6. View system-wide analytics and reports
````

### 2. Customer Workflow Testing

```bash
# Go to http://localhost:3000 (User App)
1. Login with customer1@fleet.com / password123
2. Browse available vehicles (Maruti, Hyundai, Toyota, etc.)
3. Create booking from Mumbai Airport to Gateway of India
4. Track booking status (pending → confirmed → in-progress → completed)
5. View trip history with Indian locations
6. Check past bookings across different cities
```

### 3. Driver Workflow Testing

```bash
# Go to http://localhost:3000 (User App)
1. Login with driver1@fleet.com / password123
2. View assigned vehicles and trips
3. Check scheduled trips (Mumbai, Bangalore, Delhi routes)
4. Start and track in-progress trips
5. Complete trips with distance and fuel data
6. View earnings and trip history
```

### 4. Owner Workflow Testing

```bash
# Go to http://localhost:3000 (User App)
1. Login with owner1@fleet.com / password123
2. Manage fleet of 8 vehicles across Indian cities
3. View all bookings for owned vehicles
4. Assign drivers to vehicles
5. Approve/manage driver assignments
6. View revenue analytics and fleet performance
7. Monitor vehicle status and maintenance
```

### 5. API Testing

```bash
# Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer1@fleet.com","password":"password123"}'

# Test protected route (replace TOKEN with received token)
curl -H "Authorization: Bearer TOKEN" http://localhost:5000/api/vehicles

# Test booking creation
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "VEHICLE_ID",
    "startDate": "2025-12-25",
    "endDate": "2025-12-27",
    "pickupLocation": {
      "address": "Mumbai Airport",
      "city": "Mumbai",
      "state": "Maharashtra"
    }
  }'
```

---

## 📊 Sample Data Overview

The populated database includes realistic Indian fleet management data:

### Vehicles

- **Sedans**: Maruti Swift Dzire, Honda City
- **SUVs**: Hyundai Creta, Toyota Innova Crysta, Mahindra Scorpio N
- **Electric**: Tata Nexon EV
- **Luxury**: Mercedes-Benz E-Class
- **Van**: Force Traveller

### Locations Covered

- **Mumbai**: Airport, Gateway of India, Bandra, Lonavala
- **Delhi**: IGI Airport, Connaught Place, Taj Mahal (Agra)
- **Bangalore**: Airport, Koramangala, Mysore, Ooty, Coorg
- **Chennai**: Airport, Marina Beach, Mahabalipuram
- **Other Cities**: Ahmedabad, Hyderabad, Kolkata, Jaipur

### Booking Scenarios

- Pending bookings for future dates
- Confirmed bookings with payment
- In-progress trips currently running
- Completed trips with ratings and feedback
- Cancelled bookings with refunds

---

## � Sample Data Overview

The populated database includes realistic Indian fleet management data:

### Vehicles

- **Sedans**: Maruti Swift Dzire, Honda City
- **SUVs**: Hyundai Creta, Toyota Innova Crysta, Mahindra Scorpio N
- **Electric**: Tata Nexon EV
- **Luxury**: Mercedes-Benz E-Class
- **Van**: Force Traveller

### Locations Covered

- **Mumbai**: Airport, Gateway of India, Bandra, Lonavala
- **Delhi**: IGI Airport, Connaught Place, Taj Mahal (Agra)
- **Bangalore**: Airport, Koramangala, Mysore, Ooty, Coorg
- **Chennai**: Airport, Marina Beach, Mahabalipuram
- **Other Cities**: Ahmedabad, Hyderabad, Kolkata, Jaipur

### Booking Scenarios

- Pending bookings for future dates
- Confirmed bookings with payment
- In-progress trips currently running
- Completed trips with ratings and feedback
- Cancelled bookings with refunds

### User Distribution

- **13 Total Users**: 1 Admin, 2 Owners, 4 Drivers, 6 Customers
- **All passwords**: `password123`
- **Indian names and addresses** for realistic testing
- **Multiple user types** to test all workflows

---

## 🗄️ Database Schema

### User Model

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "customer" | "driver" | "owner" | "admin",
  phone: String,
  address: {
    street, city, state, zipCode, country
  },
  licenseNumber: String (for drivers),
  licenseExpiry: Date (for drivers)
}
```

### Vehicle Model

```javascript
{
  owner: ObjectId (ref: User),
  make: String,
  model: String,
  year: Number,
  registrationNumber: String (unique),
  vehicleType: "sedan" | "suv" | "van" | "luxury" | "electric",
  capacity: { passengers, luggage },
  features: Array,
  fuelType: "petrol" | "diesel" | "electric" | "hybrid" | "cng",
  pricePerDay: Number,
  pricePerHour: Number,
  location: { address, city, state },
  availability: "available" | "unavailable",
  status: "active" | "maintenance" | "inactive"
}
```

### Booking Model

```javascript
{
  customer: ObjectId (ref: User),
  vehicle: ObjectId (ref: Vehicle),
  bookingType: "hourly" | "daily" | "weekly" | "monthly",
  startDate: Date,
  endDate: Date,
  pickupLocation: { address, city, state, zipCode },
  dropoffLocation: { address, city, state, zipCode },
  pricing: {
    basePrice: Number,
    taxes: Number,
    discount: Number,
    totalPrice: Number
  },
  status: "pending" | "confirmed" | "cancelled" | "completed" | "in_progress",
  paymentStatus: "pending" | "paid" | "refunded" | "failed"
}
```

### Trip Model

```javascript
{
  booking: ObjectId (ref: Booking),
  customer: ObjectId (ref: User),
  driver: ObjectId (ref: User),
  vehicle: ObjectId (ref: Vehicle),
  status: "scheduled" | "in_progress" | "completed" | "cancelled",
  startedAt: Date,
  completedAt: Date,
  distance: { planned, actual },
  odometerStart: Number,
  odometerEnd: Number,
  fuelLevel: { start, end },
  revenue: Number,
  expenses: { fuel, tolls, parking, other },
  rating: { customer, driver },
  feedback: { customer, driver }
}
```

### Driver Assignment Model

```javascript
{
  driver: ObjectId (ref: User),
  vehicle: ObjectId (ref: Vehicle),
  status: "pending" | "approved" | "rejected" | "active" | "inactive",
  assignedDate: Date,
  approvedBy: ObjectId (ref: User),
  approvedDate: Date,
  notes: String
}
```

---

## �🛠 Technology Stack

### Backend

- **Node.js** + **Express.js** - REST API server
- **MongoDB** + **Mongoose** - Database and ODM
- **JWT** - Authentication and authorization
- **Redis** - Session management and caching
- **bcryptjs** - Password hashing
- **Winston** - Logging

### User Application (Next.js)

- **Next.js 14** - React framework with SSR
- **React 18** - Frontend library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling and responsive design
- **Axios** - API communication

### Admin Portal (React SPA)

- **React 18** + **TypeScript** - Frontend framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling system
- **Recharts** - Data visualization
- **React Router** - Client-side routing

---

## 📁 Project Structure

```
fleet_management-v2/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── controllers/     # API route handlers
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, validation, errors
│   │   └── utils/           # Helper functions
│   ├── scripts/             # Database setup scripts
│   └── package.json
│
├── user-app/                # Next.js application
│   ├── src/
│   │   ├── pages/           # Next.js pages & API routes
│   │   ├── components/      # Reusable UI components
│   │   └── lib/             # Utilities and API client
│   └── package.json
│
└── admin-portal/            # React admin dashboard
    ├── src/
    │   ├── pages/           # Dashboard pages
    │   ├── components/      # UI components
    │   └── lib/             # Utilities and API client
    └── package.json
```

---

## 🔍 Key Features Demonstrated

### ✅ Authentication & Authorization

- JWT-based authentication with access tokens (15min) and refresh tokens (7 days)
- Role-based access control (Customer, Driver, Owner, Admin)
- Password hashing with bcryptjs
- Protected routes and API endpoints

### ✅ Database Operations

- MongoDB with Mongoose ODM
- Complex relationships between Users, Vehicles, Bookings, Trips
- Data validation and constraints
- Aggregation pipelines for analytics

### ✅ Real-time Features

- Booking status updates
- Trip management workflow
- Dashboard analytics with live data

### ✅ Modern UI/UX

- Responsive dark theme design
- Form validation with error handling
- Loading states and animations
- Mobile-friendly interface

### ✅ API Design

- RESTful API architecture
- Request/response validation
- Error handling and logging
- Rate limiting and security

---

## 🚀 Production Deployment Guide

### Option 1: AWS Deployment (ECS + S3)

#### Prerequisites

- AWS Account with CLI configured
- Docker installed
- Domain name (optional)

#### Backend Deployment

```bash
# 1. Create ECR repository
aws ecr create-repository --repository-name fleet-backend --region us-east-1

# 2. Build and push Docker image
cd backend
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker build -t fleet-backend .
docker tag fleet-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/fleet-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/fleet-backend:latest

# 3. Create ECS cluster and service
aws ecs create-cluster --cluster-name fleet-cluster --region us-east-1
# Register task definition (see task-definition.json below)
aws ecs register-task-definition --cli-input-json file://task-definition.json
aws ecs create-service --cluster fleet-cluster --service-name fleet-backend --task-definition fleet-backend-task --desired-count 1 --launch-type FARGATE
```

#### Frontend Deployment

```bash
# User App (Next.js)
cd user-app
echo "NEXT_PUBLIC_API_URL=http://<backend-url>:5000/api" > .env.production
npm run build
aws s3 sync out/ s3://fleet-user-app --delete

# Admin Portal (React)
cd admin-portal
echo "VITE_API_URL=http://<backend-url>:5000/api" > .env.production
npm run build
aws s3 sync dist/ s3://fleet-admin-portal --delete

# Configure S3 for static hosting
aws s3api put-bucket-website --bucket fleet-user-app --website-configuration '{"IndexDocument":{"Suffix":"index.html"}}'
aws s3api put-bucket-website --bucket fleet-admin-portal --website-configuration '{"IndexDocument":{"Suffix":"index.html"}}'
```

#### Sample task-definition.json

```json
{
  "family": "fleet-backend-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "fleet-backend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/fleet-backend:latest",
      "portMappings": [{ "containerPort": 5000 }],
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        {
          "name": "MONGODB_URI",
          "value": "mongodb+srv://user:password@cluster.mongodb.net/fleet_management"
        },
        { "name": "JWT_SECRET", "value": "production-secret" },
        { "name": "REDIS_ENABLED", "value": "false" }
      ]
    }
  ]
}
```

### Option 2: Digital Ocean Deployment

```bash
# 1. Create MongoDB Atlas database
# 2. Deploy backend to Digital Ocean App Platform
# 3. Deploy frontends to Digital Ocean Spaces (S3-compatible)
# 4. Configure domain and SSL
```

### Option 3: Railway/Render Deployment

```bash
# 1. Connect GitHub repository
# 2. Configure environment variables
# 3. Deploy with automatic builds
```

---

## 🔧 Development Tips

### Database Reset

```bash
cd backend
# Clear all data and repopulate with fresh Indian data
node scripts/populateDummyData.js
```

> **Note**: The populate script automatically clears existing data before inserting new data, so you don't need a separate clear script.

### Environment Variables

```bash
# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/fleet_management
JWT_SECRET=your-jwt-secret
REDIS_ENABLED=false
PORT=5000
NODE_ENV=development

# User App (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Admin Portal (.env)
VITE_API_URL=http://localhost:5000/api
```

### Common Issues

**Port conflicts**: If ports are in use, the apps will auto-switch to available ports  
**MongoDB connection**: Ensure MongoDB is running locally or use MongoDB Atlas  
**CORS errors**: Check that API URLs in frontend match backend URL

---

## 📝 Assignment Requirements Met

✅ **MERN Stack Implementation** - Complete MongoDB, Express, React, Node.js  
✅ **Authentication** - JWT with role-based access control  
✅ **Database Design** - Complex schemas with relationships  
✅ **RESTful API** - Proper REST endpoints with validation  
✅ **Modern Frontend** - React with hooks and modern practices  
✅ **Responsive Design** - Mobile-friendly UI/UX  
✅ **Production Ready** - Deployment guide and best practices  
✅ **Testing Ready** - Complete test data and user workflows

---

## 🤝 Support

For issues or questions:

1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure all services are running on correct ports
4. Check MongoDB connection
5. Test API endpoints directly
