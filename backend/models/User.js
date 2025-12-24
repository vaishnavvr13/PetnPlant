import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false, // Don't include password in queries by default
  },
  fullName: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  userType: {
    type: String,
    enum: ['pet_owner', 'plant_owner', 'both', 'provider'],
    default: 'pet_owner',
  },
  role: {
    type: String,
    enum: ['user', 'provider', 'admin'],
    default: 'user',
  },
  avatarUrl: {
    type: String,
  },
  preferences: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allows null values to be unique
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for faster queries
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ userType: 1 });

export default mongoose.model('User', userSchema);
