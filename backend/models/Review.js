import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
    },
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});

// Indexes
reviewSchema.index({ provider: 1, createdAt: -1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ booking: 1 }, { unique: true }); // One review per booking

export default mongoose.model('Review', reviewSchema);
