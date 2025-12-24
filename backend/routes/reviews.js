import express from 'express';
import {
    createReview,
    getProviderReviews,
    getReviewByBooking,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/provider/:providerId', getProviderReviews);
router.get('/booking/:bookingId', protect, getReviewByBooking);

export default router;
