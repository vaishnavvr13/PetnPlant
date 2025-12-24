import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import connectDB from './config/database.js';
import { errorHandler, notFound } from './middleware/error.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:8080'],
        credentials: true,
    },
});

// Make io accessible to routes
app.set('io', io);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// CORS - Allow multiple origins
const allowedOrigins = ['http://localhost:5173', 'http://localhost:8080'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

// Security headers
app.use(helmet());

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Routes
import authRoutes from './routes/auth.js';
import serviceRoutes from './routes/services.js';
import bookingRoutes from './routes/bookings.js';
import reviewRoutes from './routes/reviews.js';
import notificationRoutes from './routes/notifications.js';
import userRoutes from './routes/users.js';
import uploadRoutes from './routes/upload.js';
import kycRoutes from './routes/kyc.js';

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/kyc', kycRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

// Socket.io connection handling
const userSockets = new Map(); // Map userId to socketId

io.on('connection', (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    // User joins their personal room
    socket.on('join', (userId) => {
        socket.join(userId);
        userSockets.set(userId, socket.id);
        console.log(`👤 User ${userId} joined their room`);
    });

    // User leaves
    socket.on('disconnect', () => {
        // Remove user from map
        for (const [userId, socketId] of userSockets.entries()) {
            if (socketId === socket.id) {
                userSockets.delete(userId);
                console.log(`👋 User ${userId} disconnected`);
                break;
            }
        }
    });

    // Handle typing indicators (optional)
    socket.on('typing', (data) => {
        socket.to(data.recipientId).emit('userTyping', {
            userId: data.userId,
            isTyping: data.isTyping,
        });
    });
});

// Export io for use in controllers
export { io };

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                        ║
║   🚀 PetPlant Pals API Server Running                 ║
║                                                        ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}                        ║
║   📡 Port: ${PORT}                                    ║
║   🔗 URL: http://localhost:${PORT}                    ║
║   📊 Database: Connected                              ║
║   🔌 Socket.io: Active                                ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`❌ Error: ${err.message}`);
    // Close server & exit process
    httpServer.close(() => process.exit(1));
});

export default app;
