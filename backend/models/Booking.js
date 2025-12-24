import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'],
        default: 'pending',
    },
    scheduledDate: {
        type: Date,
        required: [true, 'Scheduled date is required'],
    },
    scheduledTime: {
        type: String,
        required: [true, 'Scheduled time is required'],
    },
    durationHours: {
        type: Number,
        required: [true, 'Duration is required'],
        min: 1,
    },
    totalPrice: {
        type: Number,
        required: [true, 'Total price is required'],
        min: 0,
    },
    notes: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});

// Indexes
bookingSchema.index({ owner: 1, createdAt: -1 });
bookingSchema.index({ provider: 1, createdAt: -1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ scheduledDate: 1 });

export default mongoose.model('Booking', bookingSchema);
