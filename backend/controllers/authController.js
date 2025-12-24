import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const { email, password, fullName, userType } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email',
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Determine role based on userType
        const role = userType === 'provider' ? 'provider' : 'user';

        // Create user
        const user = await User.create({
            email,
            password: hashedPassword,
            fullName,
            userType,
            role,
        });

        // Generate token
        const token = generateToken(user._id);

        // Send response
        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                userType: user.userType,
                role: user.role,
                avatarUrl: user.avatarUrl,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password',
            });
        }

        // Check for user (include password)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Your account has been deactivated',
            });
        }

        // Generate token
        const token = generateToken(user._id);

        // Send response
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                userType: user.userType,
                role: user.role,
                avatarUrl: user.avatarUrl,
                phone: user.phone,
                preferences: user.preferences,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                userType: user.userType,
                role: user.role,
                avatarUrl: user.avatarUrl,
                phone: user.phone,
                preferences: user.preferences,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const { fullName, phone, userType, avatarUrl, preferences } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Update fields
        if (fullName !== undefined) user.fullName = fullName;
        if (phone !== undefined) user.phone = phone;
        if (userType !== undefined) user.userType = userType;
        if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
        if (preferences !== undefined) user.preferences = preferences;

        await user.save();

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                userType: user.userType,
                role: user.role,
                avatarUrl: user.avatarUrl,
                phone: user.phone,
                preferences: user.preferences,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
};
