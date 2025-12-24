# PetPlant Pals Backend API

MongoDB + Express backend for the PetPlant Pals marketplace application.

## 🚀 Features

- **Authentication**: JWT-based auth with bcrypt password hashing
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.io for live notifications and updates
- **Security**: Helmet, CORS, Rate limiting
- **File Upload**: Cloudinary integration (optional)
- **Role-Based Access Control**: User, Provider, Admin roles

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)

### Setup Steps

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Configure Environment Variables**

Copy `.env.example` to `.env` and update the values:
```bash
cp .env.example .env
```

Required variables:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string for JWT signing
- `FRONTEND_URL`: Your frontend URL (for CORS)

3. **Start MongoDB**

If using local MongoDB:
```bash
# On Windows
net start MongoDB

# On Mac/Linux
sudo systemctl start mongod
```

Or use **MongoDB Atlas** (cloud):
- Create free cluster at https://cloud.mongodb.com
- Get connection string
- Update `MONGODB_URI` in `.env`

4. **Run the Server**

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will start at `http://localhost:5000`

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user (protected)
- `PUT /profile` - Update profile (protected)
- `POST /logout` - Logout user (protected)

### Services (`/api/services`)
- `GET /` - Get all active services
- `GET /:id` - Get single service
- `GET /provider/:providerId` - Get provider's services
- `POST /` - Create service (provider only)
- `PUT /:id` - Update service (provider only)
- `DELETE /:id` - Delete service (provider only)

### Bookings (`/api/bookings`)
- `POST /` - Create booking (protected)
- `GET /` - Get user's bookings (protected)
- `GET /:id` - Get single booking (protected)
- `PUT /:id` - Update booking status (protected)

### Reviews (`/api/reviews`)
- `POST /` - Create review (protected)
- `GET /provider/:providerId` - Get provider reviews
- `GET /booking/:bookingId` - Get review by booking (protected)

### Notifications (`/api/notifications`)
- `GET /` - Get user notifications (protected)
- `PUT /:id/read` - Mark as read (protected)
- `PUT /read-all` - Mark all as read (protected)
- `DELETE /:id` - Delete notification (protected)

### Users (`/api/users`)
- `GET /:id` - Get user profile
- `GET /` - Get all users (admin only)
- `PUT /:id/role` - Update user role (admin only)
- `PUT /:id/status` - Activate/deactivate user (admin only)

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```javascript
Authorization: Bearer <your_jwt_token>
```

Example request format:
```javascript
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "userType": "pet_owner" // or 'provider', 'plant_owner', 'both'
}
```

Example response:
```javascript
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "64f...",
    "email": "user@example.com",
    "fullName": "John Doe",
    "userType": "pet_owner",
    "role": "user"
  }
}
```

## 🔌 Socket.io Events

### Client → Server
- `join` - Join user's personal room (send userId)

### Server → Client
- `newNotification` - New notification received
- `bookingUpdate` - Booking status changed

Example client connection:
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

socket.on('connect', () => {
  socket.emit('join', userId);
});

socket.on('newNotification', (notification) => {
  console.log('New notification:', notification);
});
```

## 📊 Database Models

- **User**: User accounts with roles and profiles
- **Service**: Provider services with categories and pricing
- **Booking**: Service bookings with scheduling
- **Review**: Service reviews and ratings
- **Notification**: User notifications
- **KYCDocument**: Provider verification documents

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting (100 requests per 10 minutes)
- Helmet.js for security headers
- CORS configuration
- Input validation
- Role-based access control

## 🧪 Testing

```bash
# Create a test user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","fullName":"Test User","userType":"pet_owner"}'

# Health check
curl http://localhost:5000/api/health
```

## 📚 Tech Stack

- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Helmet** - Security headers
- **Morgan** - HTTP logging
- **Compression** - Response compression

## 🚧 Development

```bash
# Start with nodemon (auto-restart)
npm run dev

# Start without nodemon
npm start
```

## 🌐 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<strong-random-secret>
FRONTEND_URL=https://your-frontend-domain.com
```

### Deployment Platforms
- **Backend**: Railway, Render, Heroku, DigitalOcean
- **Database**: MongoDB Atlas
- **File Storage**: Cloudinary, AWS S3

## 📝 License

MIT

## 👨‍💻 Author

PetPlant Pals Team
