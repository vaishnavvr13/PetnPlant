import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Service from './models/Service.js';
import Booking from './models/Booking.js';
import Review from './models/Review.js';
import Notification from './models/Notification.js';
import connectDB from './config/database.js';

dotenv.config();

const seedDatabase = async () => {
    try {
        await connectDB();

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Service.deleteMany({});
        await Booking.deleteMany({});
        await Review.deleteMany({});
        await Notification.deleteMany({});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // Create Users
        console.log('👥 Creating users...');

        const admin = await User.create({
            email: 'admin@petplant.com',
            password: await bcrypt.hash('admin123', salt),
            fullName: 'Admin User',
            userType: 'both',
            role: 'admin',
            isEmailVerified: true,
            isActive: true,
        });

        const providers = await User.insertMany([
            {
                email: 'sarah.pets@example.com',
                password: hashedPassword,
                fullName: 'Sarah Anderson',
                phone: '+1-555-0101',
                userType: 'provider',
                role: 'provider',
                avatarUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiM4QjVDRjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSI0MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TQTwvdGV4dD48L3N2Zz4=',
                isEmailVerified: true,
            },
            {
                email: 'john.walker@example.com',
                password: hashedPassword,
                fullName: 'John Walker',
                phone: '+1-555-0102',
                userType: 'provider',
                role: 'provider',
                avatarUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMzQjgyRjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSI0MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5KVzwvdGV4dD48L3N2Zz4=',
                isEmailVerified: true,
            },
            {
                email: 'emily.green@example.com',
                password: hashedPassword,
                fullName: 'Emily Green',
                phone: '+1-555-0103',
                userType: 'provider',
                role: 'provider',
                avatarUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMxMEI5ODEiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSI0MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5FRzwvdGV4dD48L3N2Zz4=',
                isEmailVerified: true,
            },
            {
                email: 'mike.trainer@example.com',
                password: hashedPassword,
                fullName: 'Mike Thompson',
                phone: '+1-555-0104',
                userType: 'provider',
                role: 'provider',
                avatarUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNGNTk=',
                isEmailVerified: true,
            },
        ]);

        const owners = await User.insertMany([
            {
                email: 'alice.owner@example.com',
                password: hashedPassword,
                fullName: 'Alice Cooper',
                phone: '+1-555-0201',
                userType: 'pet_owner',
                role: 'user',
                isEmailVerified: true,
            },
            {
                email: 'bob.plant@example.com',
                password: hashedPassword,
                fullName: 'Bob Martinez',
                phone: '+1-555-0202',
                userType: 'plant_owner',
                role: 'user',
                isEmailVerified: true,
            },
        ]);

        // Create Services
        console.log('🛠️  Creating services...');

        const services = await Service.insertMany([
            {
                provider: providers[0]._id,
                title: 'Premium Pet Sitting',
                description: 'Professional pet care in your home. I have 5+ years of experience caring for dogs, cats, and small animals.',
                category: 'pet_sitting',
                pricePerHour: 25,
                location: 'Downtown, New York',
                isActive: true,
            },
            {
                provider: providers[0]._id,
                title: 'Pet Grooming Service',
                description: 'Full grooming services including bath, haircut, nail trim, and ear cleaning.',
                category: 'pet_grooming',
                pricePerHour: 40,
                location: 'Manhattan, New York',
                isActive: true,
            },
            {
                provider: providers[1]._id,
                title: 'Daily Dog Walking',
                description: 'Energetic and reliable dog walker available for daily walks. I cover up to 5 miles.',
                category: 'dog_walking',
                pricePerHour: 20,
                location: 'Brooklyn, New York',
                isActive: true,
            },
            {
                provider: providers[1]._id,
                title: 'Puppy Training Classes',
                description: 'Basic obedience training for puppies. Positive reinforcement methods only.',
                category: 'pet_training',
                pricePerHour: 50,
                location: 'Queens, New York',
                isActive: true,
            },
            {
                provider: providers[2]._id,
                title: 'Plant Care & Maintenance',
                description: 'Expert plant care services including watering, pruning, repotting, and pest control.',
                category: 'plant_care',
                pricePerHour: 30,
                location: 'Upper East Side, New York',
                isActive: true,
            },
            {
                provider: providers[2]._id,
                title: 'Garden Maintenance',
                description: 'Complete garden care including weeding, mulching, and seasonal planting.',
                category: 'garden_maintenance',
                pricePerHour: 35,
                location: 'Brooklyn, New York',
                isActive: true,
            },
            {
                provider: providers[3]._id,
                title: 'Advanced Dog Training',
                description: 'Specialized training for behavioral issues and advanced commands.',
                category: 'pet_training',
                pricePerHour: 60,
                location: 'Manhattan, New York',
                isActive: true,
            },
        ]);

        // Create Bookings
        console.log('📅 Creating bookings...');

        const bookings = await Booking.insertMany([
            {
                service: services[0]._id,
                owner: owners[0]._id,
                provider: providers[0]._id,
                status: 'completed',
                scheduledDate: new Date('2024-12-15'),
                scheduledTime: '14:00',
                durationHours: 3,
                totalPrice: 75,
                notes: 'My golden retriever needs care while I\'m at work.',
            },
            {
                service: services[2]._id,
                owner: owners[0]._id,
                provider: providers[1]._id,
                status: 'confirmed',
                scheduledDate: new Date('2024-12-22'),
                scheduledTime: '10:00',
                durationHours: 1,
                totalPrice: 20,
                notes: 'Daily morning walk for my beagle.',
            },
            {
                service: services[4]._id,
                owner: owners[1]._id,
                provider: providers[2]._id,
                status: 'pending',
                scheduledDate: new Date('2024-12-25'),
                scheduledTime: '09:00',
                durationHours: 2,
                totalPrice: 60,
                notes: 'Need help with indoor plant care during holidays.',
            },
        ]);

        // Create Reviews
        console.log('⭐ Creating reviews...');

        await Review.insertMany([
            {
                booking: bookings[0]._id,
                reviewer: owners[0]._id,
                provider: providers[0]._id,
                rating: 5,
                comment: 'Sarah was amazing! My dog loved her and she sent regular updates. Highly recommended!',
            },
        ]);

        // Create Notifications
        console.log('🔔 Creating notifications...');

        await Notification.insertMany([
            {
                user: providers[0]._id,
                title: 'New Booking Request',
                message: 'You have a new booking request for Premium Pet Sitting',
                type: 'info',
                read: false,
            },
            {
                user: owners[0]._id,
                title: 'Booking Confirmed!',
                message: 'Your booking for Daily Dog Walking has been confirmed',
                type: 'success',
                read: false,
            },
            {
                user: providers[2]._id,
                title: 'New Booking Request',
                message: 'You have a new booking request for Plant Care & Maintenance',
                type: 'info',
                read: false,
            },
        ]);

        console.log('\n✅ Database seeded successfully!\n');
        console.log('═══════════════════════════════════════════════════════');
        console.log('📊 SEEDED DATA SUMMARY');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`👤 Users: ${providers.length + owners.length + 1} (1 admin, ${providers.length} providers, ${owners.length} owners)`);
        console.log(`🛠️  Services: ${services.length}`);
        console.log(`📅 Bookings: ${bookings.length}`);
        console.log(`⭐ Reviews: 1`);
        console.log(`🔔 Notifications: 3`);
        console.log('═══════════════════════════════════════════════════════\n');

        console.log('🔐 TEST ACCOUNTS:');
        console.log('───────────────────────────────────────────────────────');
        console.log('Admin:');
        console.log('  Email: admin@petplant.com');
        console.log('  Password: admin123\n');
        console.log('Provider (Sarah):');
        console.log('  Email: sarah.pets@example.com');
        console.log('  Password: password123\n');
        console.log('Provider (John):');
        console.log('  Email: john.walker@example.com');
        console.log('  Password: password123\n');
        console.log('Owner (Alice):');
        console.log('  Email: alice.owner@example.com');
        console.log('  Password: password123');
        console.log('═══════════════════════════════════════════════════════\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
