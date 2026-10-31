import { ApiResponse } from "../utils/apiResponse.js"
import { ApiError } from "../utils/apiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import DonerRequest from "../models/DonerRequest.model.js"
import Doner from "../models/Doner.model.js"
import Admin from "../models/Admin.model.js"
import Organ from "../models/Organ.model.js"

// Create donor request and assign to first admin alphabetically
const createDonorRequest = asyncHandler(async (req, res) => {
    const { organType, bloodGroup, doner } = req.body;

    // Validate required fields
    if (!organType || !bloodGroup || !doner) {
        throw new ApiError(400, "Organ type, blood group, and donor are required");
    }

    // Check if donor exists
    const donorExists = await Doner.findById(doner);
    if (!donorExists) {
        throw new ApiError(404, "Donor not found");
    }

    // Check if organ type is valid (from the enum values)
    const validOrganTypes = ["kidney", "liver", "heart", "lung", "cornea", "pancreas", "intestine"];
    if (!validOrganTypes.includes(organType)) {
        throw new ApiError(400, "Invalid organ type. Must be one of: kidney, liver, heart, lung, cornea, pancreas, intestine");
    }

    // Find the first admin alphabetically by user's email or name
    const firstAdmin = await Admin.findOne()
        .populate("user", "email fullName")
        .sort({ "user.email": 1 }); // Sort by user email alphabetically

    if (!firstAdmin) {
        throw new ApiError(404, "No admin available to process the request");
    }

    const organ = await Organ.create({
        type: organType
    });

    if(!organ) {
        throw new ApiError(500, "Failed to create organ");
    }

    // Create the donor request
    const newDonorRequest = await DonerRequest.create({
        organType: organ._id,
        bloodGroup,
        doner,
        admin: firstAdmin._id // Assign to the first admin alphabetically
    });

    if(!newDonorRequest) {
        throw new ApiError(500, "Failed to create donor request");
    }

    // Populate the request with related data
    const populatedRequest = await DonerRequest.findById(newDonorRequest._id)
        .populate("organType", "type")
        .populate("doner", "bloodGroup location")
        .populate({
            path: "admin",
            populate: {
                path: "user",
                select: "fullName email"
            }
        })
        .select("-__v");

    if (!populatedRequest) {
        throw new ApiError(500, "Failed to populate donor request");
    }

    return res.status(201).json(
        new ApiResponse(201, populatedRequest, "Donor request created and assigned to admin successfully")
    );
});

// Get all donor requests for a specific admin
const getAdminDonorRequests = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = { admin: req.admin._id };
    
    if (status) {
        filter.status = status;
    }

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        populate: [
            { path: "organType", select: "type" },
            { path: "doner", select: "bloodGroup location age gender", populate: { path: "user", select: "fullName email" } },
            { 
                path: "admin", 
                populate: { 
                    path: "user", 
                    select: "fullName email" 
                } 
            }
        ],
        select: "-__v"
    };

    const requests = await DonerRequest.paginate(filter, options);

    return res.status(200).json(
        new ApiResponse(200, requests, "Admin donor requests retrieved successfully")
    );
});

// Admin confirms or rejects a donor request
const confirmDonorRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { confirmation } = req.body; // confirmation: 'fulfilled' or 'rejected'

    if (!confirmation || !['fulfilled', 'rejected'].includes(confirmation)) {
        throw new ApiError(400, "Valid confirmation status is required (fulfilled or rejected)");
    }

    // Find the request
    const donorRequest = await DonerRequest.findById(requestId)
        .populate("organType", "type")
        .populate("doner", "bloodGroup location");

    if (!donorRequest) {
        throw new ApiError(404, "Donor request not found");
    }

    // Check if the current admin is assigned to this request
    if (donorRequest.admin.toString() !== req.admin._id.toString()) {
        throw new ApiError(403, "You are not authorized to confirm this request");
    }

    // Update only the adminConfirmation field
    donorRequest.adminConfirmation = confirmation;
    
    // If fulfilled, also verify the donor (but don't change the status)
    if (confirmation === 'fulfilled') {
        // Set the donor's isVerified to true
        await Doner.findByIdAndUpdate(
            donorRequest.doner._id,
            { isVerified: true },
            { new: true }
        );
    }

    await donorRequest.save();

    // Get updated request with populated data
    const updatedRequest = await DonerRequest.findById(requestId)
        .populate("organType", "type")
        .populate("doner", "bloodGroup location age gender")
        .populate({
            path: "admin",
            populate: {
                path: "user",
                select: "fullName email"
            }
        })
        .select("-__v");

    return res.status(200).json(
        new ApiResponse(200, updatedRequest, `Donor request ${confirmation} successfully`)
    );
});

// Get all donor requests (for super admin or monitoring)
const getAllDonorRequests = asyncHandler(async (req, res) => {
    const { status, adminConfirmation, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    
    if (status) filter.status = status;
    if (adminConfirmation) filter.adminConfirmation = adminConfirmation;

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        populate: [
            { path: "organType", select: "type" },
            { path: "doner", select: "bloodGroup location age gender", populate: { path: "user", select: "fullName email" } },
            { 
                path: "admin", 
                populate: { 
                    path: "user", 
                    select: "fullName email" 
                } 
            }
        ],
        select: "-__v"
    };

    const requests = await DonerRequest.paginate(filter, options);

    return res.status(200).json(
        new ApiResponse(200, requests, "All donor requests retrieved successfully")
    );
});

// Get donor request by ID
const getDonorRequestById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const request = await DonerRequest.findById(id)
        .populate("organType", "name description")
        .populate("doner", "bloodGroup location age gender contactInfo")
        .populate({
            path: "admin",
            populate: {
                path: "user",
                select: "fullName email"
            }
        })
        .select("-__v");

    if (!request) {
        throw new ApiError(404, "Donor request not found");
    }

    return res.status(200).json(
        new ApiResponse(200, request, "Donor request retrieved successfully")
    );
});

// Reassign donor request to another admin (if needed)
const reassignDonorRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { adminId } = req.body;

    if (!adminId) {
        throw new ApiError(400, "Admin ID is required for reassignment");
    }

    // Check if new admin exists
    const newAdmin = await Admin.findById(adminId);
    if (!newAdmin) {
        throw new ApiError(404, "New admin not found");
    }

    // Find and update the request
    const updatedRequest = await DonerRequest.findByIdAndUpdate(
        requestId,
        { 
            admin: adminId,
            adminConfirmation: 'pending' // Reset confirmation status
        },
        { new: true, runValidators: true }
    )
    .populate("organType", "name description")
    .populate("doner", "bloodGroup location")
    .populate({
        path: "admin",
        populate: {
            path: "user",
            select: "fullName email"
        }
    })
    .select("-__v");

    if (!updatedRequest) {
        throw new ApiError(404, "Donor request not found");
    }

    return res.status(200).json(
        new ApiResponse(200, updatedRequest, "Donor request reassigned successfully")
    );
});

export {
    createDonorRequest,
    getAdminDonorRequests,
    confirmDonorRequest,
    getAllDonorRequests,
    getDonorRequestById,
    reassignDonorRequest
};