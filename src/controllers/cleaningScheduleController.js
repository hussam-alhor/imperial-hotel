const expressAsyncHandler = require("express-async-handler");
const { CleaningSchedule, validationCreateCleaningSchedule, validationUpdateCleaningSchedule } = require("../models/CleaningSchedule");
const { Room } = require("../models/Room");

/**
 * @route   POST /api/cleaning-schedules
 * @desc    Create a new cleaning schedule
 * @access  Private (Employee or Admin)
 */
module.exports.createCleaningScheduleCtrl = expressAsyncHandler(async (req, res) => {
    // 1. Validate input
    const { error } = validationCreateCleaningSchedule(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // 2. Check if room exists
    const room = await Room.findById(req.body.room);
    if (!room) {
        return res.status(404).json({ message: "Room not found" });
    }

    // 3. Create cleaning schedule
    const cleaningSchedule = await CleaningSchedule.create(req.body);

    // 4. Send response
    res.status(201).json({
        id: cleaningSchedule._id,
        room: cleaningSchedule.room,
        scheduledDate: cleaningSchedule.scheduledDate,
        status: cleaningSchedule.status,
        notes: cleaningSchedule.notes,
        message: "Cleaning schedule created successfully.",
    });
});

/**
 * @route   GET /api/cleaning-schedules
 * @desc    Get all cleaning schedules
 * @access  Private (Employee or Admin)
 */
module.exports.getAllCleaningSchedulesCtrl = expressAsyncHandler(async (req, res) => {
    const cleaningSchedules = await CleaningSchedule.find().populate('room');
    res.status(200).json(cleaningSchedules);
});

/**
 * @route   GET /api/cleaning-schedules/:id
 * @desc    Get cleaning schedule by ID
 * @access  Private (Employee or Admin)
 */
module.exports.getCleaningScheduleByIdCtrl = expressAsyncHandler(async (req, res) => {
    const cleaningSchedule = await CleaningSchedule.findById(req.params.id).populate('room');
    if (!cleaningSchedule) {
        return res.status(404).json({ message: "Cleaning schedule not found" });
    }
    res.status(200).json(cleaningSchedule);
});

/**
 * @route   PUT /api/cleaning-schedules/:id
 * @desc    Update cleaning schedule
 * @access  Private (Employee or Admin)
 */
module.exports.updateCleaningScheduleCtrl = expressAsyncHandler(async (req, res) => {
    // 1. Validate input
    const { error } = validationUpdateCleaningSchedule(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // 2. Update cleaning schedule
    const updatedCleaningSchedule = await CleaningSchedule.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
    ).populate('room');

    if (!updatedCleaningSchedule) {
        return res.status(404).json({ message: "Cleaning schedule not found" });
    }

    res.status(200).json(updatedCleaningSchedule);
});

/**
 * @route   DELETE /api/cleaning-schedules/:id
 * @desc    Delete cleaning schedule
 * @access  Private (Employee or Admin)
 */
module.exports.deleteCleaningScheduleCtrl = expressAsyncHandler(async (req, res) => {
    // 1. Find and delete cleaning schedule
    const cleaningSchedule = await CleaningSchedule.findById(req.params.id);
    if (!cleaningSchedule) {
        return res.status(404).json({ message: "Cleaning schedule not found" });
    }

    await CleaningSchedule.findByIdAndDelete(req.params.id);

    // 2. Send response
    res.status(200).json({ message: "Cleaning schedule deleted successfully." });
});