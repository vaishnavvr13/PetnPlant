import KYCDocument from '../models/KYCDocument.js';

// @desc    Get all KYC documents (admin only)
// @route   GET /api/kyc
// @access  Private/Admin
export const getAllKYCDocuments = async (req, res) => {
    try {
        const documents = await KYCDocument.find()
            .populate('user', 'fullName email avatarUrl')
            .sort({ submittedAt: -1 });

        const pending = documents.filter(d => d.status === 'pending').length;

        res.status(200).json({
            success: true,
            count: documents.length,
            pendingCount: pending,
            documents,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching KYC documents',
            error: error.message,
        });
    }
};

// @desc    Get user's KYC documents
// @route   GET /api/kyc/my-documents
// @access  Private
export const getMyKYCDocuments = async (req, res) => {
    try {
        const documents = await KYCDocument.find({ user: req.user.id })
            .sort({ submittedAt: -1 });

        res.status(200).json({
            success: true,
            documents,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching your KYC documents',
            error: error.message,
        });
    }
};

// @desc    Submit KYC document
// @route   POST /api/kyc
// @access  Private
export const submitKYCDocument = async (req, res) => {
    try {
        const { documentType, documentUrl } = req.body;

        if (!documentType || !documentUrl) {
            return res.status(400).json({
                success: false,
                message: 'Document type and URL are required',
            });
        }

        // Check if document of this type already exists and is not rejected
        const existing = await KYCDocument.findOne({
            user: req.user.id,
            documentType,
            status: { $ne: 'rejected' },
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'You have already submitted this document type',
            });
        }

        const document = await KYCDocument.create({
            user: req.user.id,
            documentType,
            documentUrl,
            status: 'pending',
        });

        res.status(201).json({
            success: true,
            document,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error submitting KYC document',
            error: error.message,
        });
    }
};

// @desc    Review KYC document (approve/reject)
// @route   PUT /api/kyc/:id/review
// @access  Private/Admin
export const reviewKYCDocument = async (req, res) => {
    try {
        const { status, adminNotes } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be either approved or rejected',
            });
        }

        const document = await KYCDocument.findById(req.params.id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'KYC document not found',
            });
        }

        document.status = status;
        document.adminNotes = adminNotes;
        document.reviewedAt = Date.now();
        document.reviewedBy = req.user.id;

        await document.save();

        // Populate user info
        await document.populate('user', 'fullName email');

        res.status(200).json({
            success: true,
            document,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error reviewing KYC document',
            error: error.message,
        });
    }
};

// @desc    Delete KYC document
// @route   DELETE /api/kyc/:id
// @access  Private/Admin
export const deleteKYCDocument = async (req, res) => {
    try {
        const document = await KYCDocument.findById(req.params.id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'KYC document not found',
            });
        }

        await document.deleteOne();

        res.status(200).json({
            success: true,
            message: 'KYC document deleted',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting KYC document',
            error: error.message,
        });
    }
};
