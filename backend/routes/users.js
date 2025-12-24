import express from 'express';
import {
    getUserProfile,
    getAllUsers,
    updateUserRole,
    updateUserStatus,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/:id', getUserProfile);
router.get('/', protect, authorize('admin'), getAllUsers);
router.put('/:id/role', protect, authorize('admin'), updateUserRole);
router.put('/:id/status', protect, authorize('admin'), updateUserStatus);

export default router;
