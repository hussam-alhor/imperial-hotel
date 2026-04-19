const expressAsyncHandler = require("express-async-handler");
const { Room, validationCreateRoom, validationUpdateRoom } = require("../models/Room");

/**
 * @route   POST /api/rooms
 * @desc    Add a new room
 * @access  Private (Employee or Admin)
 */
module.exports.addRoomCtrl = expressAsyncHandler(async (req, res) => {
    // 1. Parse amenities if it's a string (from form-data)
    if (req.body.amenities && typeof req.body.amenities === 'string') {
        try {
            req.body.amenities = JSON.parse(req.body.amenities);
        } catch (e) {
            return res.status(400).json({ message: "Invalid amenities format" });
        }
    }

    // 2. Validate input
    const { error } = validationCreateRoom(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // 3. Check if room number already exists
    let room = await Room.findOne({ roomNumber: req.body.roomNumber });
    if (room) {
        return res.status(400).json({ message: "Room with this number already exists" });
    }

    // 4. Handle images
    let images = [];
    if (req.files && req.files.length > 0) {
        images = req.files.map(file => file.path); // Cloudinary returns path as URL
    }

    // 5. Create new room
    const roomData = { ...req.body, images };
    room = await Room.create(roomData);

    // 6. Send response
    res.status(201).json({
        id: room._id,
        roomNumber: room.roomNumber,
        type: room.type,
        pricePerNight: room.pricePerNight,
        status: room.status,
        category: room.category,
        amenities: room.amenities,
        images: room.images,
        message: "Room created successfully.",
    });
});

/**
 * @route   GET /api/rooms
 * @desc    Get all rooms
 * @access  Private (Employee or Admin)
 */
module.exports.getAllRoomsCtrl = expressAsyncHandler(async (req, res) => {
    const rooms = await Room.find();
    res.status(200).json(rooms);
});

/**
 * @route   GET /api/rooms/:id
 * @desc    Get room by ID
 * @access  Private (Employee or Admin)
 */
module.exports.getRoomByIdCtrl = expressAsyncHandler(async (req, res) => {
    const room = await Room.findById(req.params.id);
    if (!room) {
        return res.status(404).json({ message: "Room not found" });
    }
    res.status(200).json(room);
});

/**
 * @route   PUT /api/rooms/:id
 * @desc    Update room
 * @access  Private (Employee or Admin)
 */
module.exports.updateRoomCtrl = expressAsyncHandler(async (req, res) => {
    // 1. Parse amenities if it's a string (from form-data)
    if (req.body.amenities && typeof req.body.amenities === 'string') {
        try {
            req.body.amenities = JSON.parse(req.body.amenities);
        } catch (e) {
            return res.status(400).json({ message: "Invalid amenities format" });
        }
    }

    // 2. Validate input
    const { error } = validationUpdateRoom(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // 3. Handle images
    let updateData = { ...req.body };
    if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => file.path);
        updateData.images = newImages; // Replace existing images or add new ones
    }

    // 4. Update room
    const updatedRoom = await Room.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true }
    );

    if (!updatedRoom) {
        return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json(updatedRoom);
});

/**
 * @route   DELETE /api/rooms/:id
 * @desc    Delete room
 * @access  Private (Employee or Admin)
 */
module.exports.deleteRoomCtrl = expressAsyncHandler(async (req, res) => {
    // 1. Find and delete room
    const room = await Room.findById(req.params.id);
    if (!room) {
        return res.status(404).json({ message: "Room not found" });
    }

    await Room.findByIdAndDelete(req.params.id);

    // 2. Send response
    res.status(200).json({ message: "Room deleted successfully." });
});