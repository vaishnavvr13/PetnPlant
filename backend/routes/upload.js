import express from 'express';
import { uploadFile, uploadSingle } from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Upload single file (converts to base64)
router.post('/', protect, uploadSingle, uploadFile);

export default router;
