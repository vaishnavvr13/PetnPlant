import express from 'express';
import {
    getServices,
    getService,
    createService,
    updateService,
    deleteService,
    getProviderServices,
} from '../controllers/serviceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getServices);
router.get('/:id', getService);
router.get('/provider/:providerId', getProviderServices);
router.post('/', protect, authorize('provider', 'admin'), createService);
router.put('/:id', protect, authorize('provider', 'admin'), updateService);
router.delete('/:id', protect, authorize('provider', 'admin'), deleteService);

export default router;
