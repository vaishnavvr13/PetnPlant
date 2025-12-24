import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
    },
    type: {
        type: String,
        enum: ['info', 'success', 'error', 'warning'],
        default: 'info',
    },
    read: {
        type: Boolean,
        default: false,
    },
    relatedBooking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
    },
}, {
    timestamps: true,
});

// Indexes
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ read: 1 });

export default mongoose.model('Notification', notificationSchema);
