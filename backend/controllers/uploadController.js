import upload from '../config/upload.js';
import fs from 'fs';

// @desc    Upload file (avatar or document)
// @route   POST /api/upload
// @access  Private
export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        // Read file and convert to base64
        const fileData = fs.readFileSync(req.file.path);
        const base64File = fileData.toString('base64');

        // Delete temp file
        fs.unlinkSync(req.file.path);

        // Return base64 data URL to save in MongoDB
        const fileUrl = `data:${req.file.mimetype};base64,${base64File}`;

        res.status(200).json({
            success: true,
            fileUrl,
            filename: req.file.filename,
            mimetype: req.file.mimetype,
            size: req.file.size,
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'File upload failed',
            error: error.message,
        });
    }
};

// Middleware wrapper for single file upload
export const uploadSingle = upload.single('file');
