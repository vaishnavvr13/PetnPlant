import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
    try {
        const { serviceId, providerId, scheduledDate, scheduledTime, durationHours, totalPrice, notes } = req.body;

        const booking = await Booking.create({
            service: serviceId,
            owner: req.user.id,
            provider: providerId,
            scheduledDate,
            scheduledTime,
            durationHours,
            totalPrice,
            notes,
        });

        // Create notification for provider
        await Notification.create({
            user: providerId,
            title: 'New Booking Request',
            message: 'You have received a new booking request.',
            type: 'info',
            relatedBooking: booking._id,
        });

        // Emit socket event (will be handled in server.js)
        if (req.app.get('io')) {
            req.app.get('io').to(providerId).emit('newNotification', {
                title: 'New Booking Request',
                message: 'You have received a new booking request.',
            });
        }

        const populatedBooking = await Booking.findById(booking._id)
            .populate('service', 'title category')
            .populate('owner', 'fullName email')
            .populate('provider', 'fullName email');

        res.status(201).json({
            success: true,
            booking: populatedBooking,
        });
    } catch (error) {
        console.error('❌ Booking creation error:', error.message);
        console.error('Error details:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get user's bookings (as owner or provider)
// @route   GET /api/bookings
// @access  Private
export const getBookings = async (req, res) => {
    try {
        const { status, asProvider } = req.query;

        let query;
        if (asProvider === 'true' || req.user.role === 'provider') {
            query = { provider: req.user.id };
        } else {
            query = { owner: req.user.id };
        }

        if (status) {
            query.status = status;
        }

        const bookings = await Booking.find(query)
            .populate('service', 'title category pricePerHour')
            .populate('owner', 'fullName email phone avatarUrl')
            .populate('provider', 'fullName email phone avatarUrl')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: bookings.length,
            bookings,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('service', 'title description category pricePerHour')
            .populate('owner', 'fullName email phone avatarUrl')
            .populate('provider', 'fullName email phone avatarUrl');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        // Check authorization
        if (
            booking.owner._id.toString() !== req.user.id &&
            booking.provider._id.toString() !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this booking',
            });
        }

        res.status(200).json({
            success: true,
            booking,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private (Provider or Owner)
export const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        // Check authorization
        const isProvider = booking.provider.toString() === req.user.id;
        const isOwner = booking.owner.toString() === req.user.id;

        if (!isProvider && !isOwner && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this booking',
            });
        }

        // Validate status transitions
        if (isProvider && !['confirmed', 'rejected', 'completed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status for provider',
            });
        }

        if (isOwner && status !== 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Owners can only cancel bookings',
            });
        }

        booking.status = status;
        await booking.save();

        // Create notification
        const notificationMessages = {
            confirmed: 'Your booking request has been confirmed by the provider.',
            rejected: 'Your booking request has been declined by the provider.',
            completed: 'Your service has been marked as completed. Please leave a review!',
            cancelled: 'Your booking has been cancelled.',
        };

        const notificationTitles = {
            confirmed: 'Booking Confirmed!',
            rejected: 'Booking Declined',
            completed: 'Service Completed',
            cancelled: 'Booking Cancelled',
        };

        const notificationUser = isProvider ? booking.owner : booking.provider;

        await Notification.create({
            user: notificationUser,
            title: notificationTitles[status],
            message: notificationMessages[status],
            type: status === 'rejected' ? 'error' : status === 'confirmed' ? 'success' : 'info',
            relatedBooking: booking._id,
        });

        // Emit socket event
        if (req.app.get('io')) {
            req.app.get('io').to(notificationUser.toString()).emit('bookingUpdate', {
                bookingId: booking._id,
                status,
                message: notificationMessages[status],
            });
        }

        const updatedBooking = await Booking.findById(booking._id)
            .populate('service', 'title category')
            .populate('owner', 'fullName email')
            .populate('provider', 'fullName email');

        res.status(200).json({
            success: true,
            booking: updatedBooking,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
