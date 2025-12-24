import mongoose from 'mongoose';

const kycDocumentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    documentType: {
        type: String,
        required: [true, 'Document type is required'],
        enum: ['government_id', 'address_proof', 'certification', 'other'],
    },
    documentUrl: {
        type: String,
        required: [true, 'Document URL is required'],
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    adminNotes: {
        type: String,
        trim: true,
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
    reviewedAt: {
        type: Date,
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});

// Indexes
kycDocumentSchema.index({ user: 1 });
kycDocumentSchema.index({ status: 1 });

export default mongoose.model('KYCDocument', kycDocumentSchema);
