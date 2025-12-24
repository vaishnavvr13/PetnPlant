import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Service title is required'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['pet_sitting', 'dog_walking', 'pet_grooming', 'pet_training', 'plant_care', 'garden_maintenance'],
    },
    pricePerHour: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    location: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});

// Indexes
serviceSchema.index({ provider: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ pricePerHour: 1 });

export default mongoose.model('Service', serviceSchema);
