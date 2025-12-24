import express from 'express';
import {
    getAllKYCDocuments,
    getMyKYCDocuments,
    submitKYCDocument,
    reviewKYCDocument,
    deleteKYCDocument,
} from '../controllers/kycController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Admin routes
router.get('/', protect, authorize('admin'), getAllKYCDocuments);
router.put('/:id/review', protect, authorize('admin'), reviewKYCDocument);
router.delete('/:id', protect, authorize('admin'), deleteKYCDocument);

// User routes
router.get('/my-documents', protect, getMyKYCDocuments);
router.post('/', protect, submitKYCDocument);

export default router;
