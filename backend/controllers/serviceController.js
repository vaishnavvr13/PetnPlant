import Service from '../models/Service.js';
import User from '../models/User.js';

// @desc    Get all services
// @route   GET /api/services
// @access  Public
export const getServices = async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice } = req.query;

        let query = { isActive: true };

        // Filter by category
        if (category && category !== 'all') {
            query.category = category;
        }

        // Search in title and description
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } },
            ];
        }

        // Price range filter
        if (minPrice || maxPrice) {
            query.pricePerHour = {};
            if (minPrice) query.pricePerHour.$gte = Number(minPrice);
            if (maxPrice) query.pricePerHour.$lte = Number(maxPrice);
        }

        const services = await Service.find(query)
            .populate('provider', 'fullName avatarUrl email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: services.length,
            services,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
export const getService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id)
            .populate('provider', 'fullName avatarUrl email phone');

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found',
            });
        }

        res.status(200).json({
            success: true,
            service,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Create new service
// @route   POST /api/services
// @access  Private (Provider only)
export const createService = async (req, res) => {
    try {
        const { title, description, category, pricePerHour, location } = req.body;

        const service = await Service.create({
            provider: req.user.id,
            title,
            description,
            category,
            pricePerHour,
            location,
        });

        res.status(201).json({
            success: true,
            service,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Provider - own services only)
export const updateService = async (req, res) => {
    try {
        let service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found',
            });
        }

        // Check ownership
        if (service.provider.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this service',
            });
        }

        service = await Service.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            service,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Provider - own services only)
export const deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found',
            });
        }

        // Check ownership
        if (service.provider.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this service',
            });
        }

        await service.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Service deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get provider's services
// @route   GET /api/services/provider/:providerId
// @access  Public
export const getProviderServices = async (req, res) => {
    try {
        const services = await Service.find({
            provider: req.params.providerId,
            isActive: true,
        }).populate('provider', 'fullName avatarUrl email');

        res.status(200).json({
            success: true,
            count: services.length,
            services,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
