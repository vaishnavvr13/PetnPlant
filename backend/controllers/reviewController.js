import Review from '../models/Review.js';
import Booking from '../models/Booking.js';

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
    try {
        const { bookingId, providerId, rating, comment } = req.body;

        // Check if booking exists and is completed
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        if (booking.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to review this booking',
            });
        }

        if (booking.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Can only review completed bookings',
            });
        }

        // Check if review already exists
        const existingReview = await Review.findOne({ booking: bookingId });
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'Review already exists for this booking',
            });
        }

        const review = await Review.create({
            booking: bookingId,
            reviewer: req.user.id,
            provider: providerId,
            rating,
            comment,
        });

        res.status(201).json({
            success: true,
            review,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get provider reviews
// @route   GET /api/reviews/provider/:providerId
// @access  Public
export const getProviderReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ provider: req.params.providerId })
            .populate('reviewer', 'fullName avatarUrl')
            .populate('booking', 'scheduledDate')
            .sort({ createdAt: -1 });

        // Calculate average rating
        const avgRating = reviews.length > 0
            ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
            : 0;

        res.status(200).json({
            success: true,
            count: reviews.length,
            avgRating: Math.round(avgRating * 10) / 10,
            reviews,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get review by booking
// @route   GET /api/reviews/booking/:bookingId
// @access  Private
export const getReviewByBooking = async (req, res) => {
    try {
        const review = await Review.findOne({ booking: req.params.bookingId })
            .populate('reviewer', 'fullName avatarUrl')
            .populate('provider', 'fullName');

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'No review found for this booking',
            });
        }

        res.status(200).json({
            success: true,
            review,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
