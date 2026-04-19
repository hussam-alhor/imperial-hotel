const expressAsyncHandler = require("express-async-handler");
const { RoomServiceRequest, validationCreateRoomServiceRequest, validationUpdateRoomServiceRequest } = require("../models/RoomServiceRequest");
const { Room } = require("../models/Room");
const { Customer } = require("../models/Customer");

/**
 * @route   POST /api/room-service-requests
 * @desc    Create a new room service request
 * @access  Private (Employee or Admin)
 */
module.exports.createRoomServiceRequestCtrl = expressAsyncHandler(async (req, res) => {
    // 1. Validate input
    const { error } = validationCreateRoomServiceRequest(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // 2. Check if room exists
    const room = await Room.findById(req.body.room);
    if (!room) {
        return res.status(404).json({ message: "Room not found" });
    }

    // 3. Check if customer exists (if provided)
    if (req.body.customer) {
        const customer = await Customer.findById(req.body.customer);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
    }

    // 4. Create room service request
    const roomServiceRequest = await RoomServiceRequest.create(req.body);

    // 5. Send response
    res.status(201).json({
        id: roomServiceRequest._id,
        room: roomServiceRequest.room,
        customer: roomServiceRequest.customer,
        requestType: roomServiceRequest.requestType,
        description: roomServiceRequest.description,
        status: roomServiceRequest.status,
        priority: roomServiceRequest.priority,
        message: "Room service request created successfully.",
    });
});

/**
 * @route   GET /api/room-service-requests
 * @desc    Get all room service requests
 * @access  Private (Employee or Admin)
 */
module.exports.getAllRoomServiceRequestsCtrl = expressAsyncHandler(async (req, res) => {
    const roomServiceRequests = await RoomServiceRequest.find().populate('room').populate('customer');
    res.status(200).json(roomServiceRequests);
});

/**
 * @route   GET /api/room-service-requests/:id
 * @desc    Get room service request by ID
 * @access  Private (Employee or Admin)
 */
module.exports.getRoomServiceRequestByIdCtrl = expressAsyncHandler(async (req, res) => {
    const roomServiceRequest = await RoomServiceRequest.findById(req.params.id).populate('room').populate('customer');
    if (!roomServiceRequest) {
        return res.status(404).json({ message: "Room service request not found" });
    }
    res.status(200).json(roomServiceRequest);
});

/**
 * @route   PUT /api/room-service-requests/:id
 * @desc    Update room service request
 * @access  Private (Employee or Admin)
 */
module.exports.updateRoomServiceRequestCtrl = expressAsyncHandler(async (req, res) => {
    // 1. Validate input
    const { error } = validationUpdateRoomServiceRequest(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // 2. Update room service request
    const updatedRoomServiceRequest = await RoomServiceRequest.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
    ).populate('room').populate('customer');

    if (!updatedRoomServiceRequest) {
        return res.status(404).json({ message: "Room service request not found" });
    }

    res.status(200).json(updatedRoomServiceRequest);
});

/**
 * @route   DELETE /api/room-service-requests/:id
 * @desc    Delete room service request
 * @access  Private (Employee or Admin)
 */
module.exports.deleteRoomServiceRequestCtrl = expressAsyncHandler(async (req, res) => {
    // 1. Find and delete room service request
    const roomServiceRequest = await RoomServiceRequest.findById(req.params.id);
    if (!roomServiceRequest) {
        return res.status(404).json({ message: "Room service request not found" });
    }

    await RoomServiceRequest.findByIdAndDelete(req.params.id);

    // 2. Send response
    res.status(200).json({ message: "Room service request deleted successfully." });
});