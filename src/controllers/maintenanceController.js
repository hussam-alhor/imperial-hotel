const expressAsyncHandler = require("express-async-handler");
const { Maintenance, validationCreateMaintenance, validationUpdateMaintenance } = require("../models/Maintenance");
const { Room } = require("../models/Room");

/**
 * @route   POST /api/maintenances
 * @desc    Create a new maintenance
 * @access  Private (Employee or Admin)
 */
module.exports.createMaintenanceCtrl = expressAsyncHandler(async (req, res) => {
    // 1. Validate input
    const { error } = validationCreateMaintenance(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // 2. Validate date order
    if (new Date(req.body.endDate) < new Date(req.body.startDate)) {
        return res.status(400).json({ message: "End date must be the same or after start date" });
    }

    // 3. Check if room exists
    const room = await Room.findById(req.body.room);
    if (!room) {
        return res.status(404).json({ message: "Room not found" });
    }

    // 3. Create maintenance
    const maintenance = await Maintenance.create(req.body);

    // 4. Update room status to 'تحت الصيانة' if in progress
    // ملاحظة: واجهة الصيانة ترسل قيم status مثل: in_progress / completed
    // لذلك نحدث حالة الغرفة بناءً على status المطلوب.
    if (req.body.status === 'in_progress') {
        await Room.findByIdAndUpdate(req.body.room, { status: 'تحت الصيانة' });
    } else if (req.body.status === 'completed') {
        await Room.findByIdAndUpdate(req.body.room, { status: 'متاحة' });
    }

    // 5. Send response
    res.status(201).json({
        id: maintenance._id,
        room: maintenance.room,
        startDate: maintenance.startDate,
        endDate: maintenance.endDate,
        description: maintenance.description,
        status: maintenance.status,
        message: "Maintenance created successfully.",
    });
});

/**
 * @route   GET /api/maintenances
 * @desc    Get all maintenances
 * @access  Private (Employee or Admin)
 */
module.exports.getAllMaintenancesCtrl = expressAsyncHandler(async (req, res) => {
    const maintenances = await Maintenance.find().populate('room');
    res.status(200).json(maintenances);
});

/**
 * @route   GET /api/maintenances/:id
 * @desc    Get maintenance by ID
 * @access  Private (Employee or Admin)
 */
module.exports.getMaintenanceByIdCtrl = expressAsyncHandler(async (req, res) => {
    const maintenance = await Maintenance.findById(req.params.id).populate('room');
    if (!maintenance) {
        return res.status(404).json({ message: "Maintenance not found" });
    }
    res.status(200).json(maintenance);
});

/**
 * @route   PUT /api/maintenances/:id
 * @desc    Update maintenance
 * @access  Private (Employee or Admin)
 */
module.exports.updateMaintenanceCtrl = expressAsyncHandler(async (req, res) => {
    // 1. Validate input
    const { error } = validationUpdateMaintenance(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // 2. Find existing maintenance
    const existingMaintenance = await Maintenance.findById(req.params.id);
    if (!existingMaintenance) {
        return res.status(404).json({ message: "Maintenance not found" });
    }

    // 3. Validate date order if dates change
    const startDate = req.body.startDate ? new Date(req.body.startDate) : existingMaintenance.startDate;
    const endDate = req.body.endDate ? new Date(req.body.endDate) : existingMaintenance.endDate;
    if (endDate < startDate) {
        return res.status(400).json({ message: "End date must be the same or after start date" });
    }

    // 4. Update maintenance
    const updatedMaintenance = await Maintenance.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
    ).populate('room');

    // 4. Update room status based on new status
    if (req.body.status === 'completed') {
        await Room.findByIdAndUpdate(updatedMaintenance.room, { status: 'متاحة' });
    } else if (req.body.status === 'in_progress') {
        await Room.findByIdAndUpdate(updatedMaintenance.room, { status: 'تحت الصيانة' });
    }

    res.status(200).json(updatedMaintenance);
});

/**
 * @route   DELETE /api/maintenances/:id
 * @desc    Delete maintenance
 * @access  Private (Employee or Admin)
 */
module.exports.deleteMaintenanceCtrl = expressAsyncHandler(async (req, res) => {
    // 1. Find and delete maintenance
    const maintenance = await Maintenance.findById(req.params.id);
    if (!maintenance) {
        return res.status(404).json({ message: "Maintenance not found" });
    }

    await Maintenance.findByIdAndDelete(req.params.id);

    // 2. Send response
    res.status(200).json({ message: "Maintenance deleted successfully." });
});