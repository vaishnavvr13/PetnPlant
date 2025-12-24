import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/database.js';

dotenv.config();

const createAdminUser = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@petplant.com' });

        if (existingAdmin) {
            console.log('❌ Admin user already exists!');
            console.log('📧 Email: admin@petplant.com');
            process.exit(0);
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        // Create admin user
        const admin = await User.create({
            email: 'admin@petplant.com',
            password: hashedPassword,
            fullName: 'Admin User',
            userType: 'both',
            role: 'admin',
            isEmailVerified: true,
            isActive: true,
        });

        console.log('✅ Admin user created successfully!');
        console.log('');
        console.log('╔═══════════════════════════════════════╗');
        console.log('║     ADMIN CREDENTIALS                 ║');
        console.log('╠═══════════════════════════════════════╣');
        console.log('║  Email:    admin@petplant.com        ║');
        console.log('║  Password: admin123                   ║');
        console.log('╚═══════════════════════════════════════╝');
        console.log('');
        console.log('⚠️  Please change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
};

createAdminUser();
