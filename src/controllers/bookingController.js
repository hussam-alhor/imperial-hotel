const expressAsyncHandler = require("express-async-handler");
const { Booking, validationCreateBooking, validationUpdateBooking } = require("../models/Booking");
const { Customer } = require("../models/Customer");
const { Room } = require("../models/Room");

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking
 * @access  Private (Employee or Admin)
 */
module.exports.createBookingCtrl = expressAsyncHandler(async (req, res) => {
    // 1. Parse specialRequests
    if (req.body.specialRequests && typeof req.body.specialRequests === 'string') {
        try { req.body.specialRequests = JSON.parse(req.body.specialRequests); } 
        catch (e) { return res.status(400).json({ message: "Invalid specialRequests format" }); }
    }

    // 2. Validate input
    const { error } = validationCreateBooking(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // 3. التحقق من التواريخ (منطق إضافي)
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const checkIn = new Date(req.body.checkInDate);
    const checkOut = new Date(req.body.checkOutDate);

    if (checkIn < now) return res.status(400).json({ message: "تاريخ الدخول لا يمكن أن يكون في الماضي" });
    if (checkOut <= checkIn) return res.status(400).json({ message: "تاريخ الخروج يجب أن يكون بعد تاريخ الدخول" });

    // 4. Check if customer exists
    const customer = await Customer.findById(req.body.customer);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    // 5. Check if room exists and is available
    const room = await Room.findById(req.body.room);
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (room.status !== 'متاحة') return res.status(400).json({ message: "Room is not available" });

    // 6. Check for overlapping bookings
    const overlappingBooking = await Booking.findOne({
        room: req.body.room,
        status: 'active',
        $or: [
            { checkInDate: { $lt: req.body.checkOutDate, $gte: req.body.checkInDate } },
            { checkOutDate: { $gt: req.body.checkInDate, $lte: req.body.checkOutDate } }
        ]
    });
    if (overlappingBooking) return res.status(400).json({ message: "Room is already booked for the selected dates" });

    // 7. Create booking
    const booking = await Booking.create(req.body);

    // 8. Update room status to 'محجوز'
    await Room.findByIdAndUpdate(req.body.room, { status: 'محجوز' });

    res.status(201).json({ id: booking._id, message: "Booking created successfully.", booking });
});

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings
 * @access  Private (Employee or Admin)
 */
module.exports.getAllBookingsCtrl = expressAsyncHandler(async (req, res) => {
    const bookings = await Booking.find().populate('customer').populate('room');
    res.status(200).json(bookings);
});

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking by ID
 * @access  Private (Employee or Admin)
 */
module.exports.getBookingByIdCtrl = expressAsyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id).populate('customer').populate('room');
    if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json(booking);
});

/**
 * @route   PUT /api/bookings/:id
 * @desc    Update booking
 * @access  Private (Employee or Admin)
 */
module.exports.updateBookingCtrl = expressAsyncHandler(async (req, res) => {
    // 1. Parse specialRequests
    if (req.body.specialRequests && typeof req.body.specialRequests === 'string') {
        try { req.body.specialRequests = JSON.parse(req.body.specialRequests); } 
        catch (e) { return res.status(400).json({ message: "Invalid specialRequests format" }); }
    }

    // 2. Validate input
    const { error } = validationUpdateBooking(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // 3. Find existing booking
    const existingBooking = await Booking.findById(req.params.id);
    if (!existingBooking) return res.status(404).json({ message: "Booking not found" });

    // 4. إذا تم تغيير الغرفة: التأكد من توفر الغرفة الجديدة وتبديل الحالات
    if (req.body.room && req.body.room !== existingBooking.room.toString()) {
        const newRoom = await Room.findById(req.body.room);
        if (!newRoom || newRoom.status !== 'متاحة') {
            return res.status(400).json({ message: "New room is not available" });
        }
        // إتاحة الغرفة القديمة
        await Room.findByIdAndUpdate(existingBooking.room, { status: 'متاحة' });
        // حجز الغرفة الجديدة
        await Room.findByIdAndUpdate(req.body.room, { status: 'محجوز' });
    }

    // 5. التحقق من التداخل في التواريخ الجديدة (إذا تم تغيير التواريخ)
    if (req.body.checkInDate || req.body.checkOutDate) {
        const overlappingBooking = await Booking.findOne({
            _id: { $ne: req.params.id }, // استثناء الحجز الحالي نفسه
            room: req.body.room || existingBooking.room,
            status: 'active',
            $or: [
                { checkInDate: { $lt: req.body.checkOutDate || existingBooking.checkOutDate, $gte: req.body.checkInDate || existingBooking.checkInDate } },
                { checkOutDate: { $gt: req.body.checkInDate || existingBooking.checkInDate, $lte: req.body.checkOutDate || existingBooking.checkOutDate } }
            ]
        });
        if (overlappingBooking) return res.status(400).json({ message: "Room is already booked for these new dates" });
    }

    // 6. Update booking
    const updatedBooking = await Booking.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
    ).populate('customer').populate('room');

    res.status(200).json(updatedBooking);
});

/**
 * @route   DELETE /api/bookings/:id
 * @desc    Cancel booking
 * @access  Private (Employee or Admin)
 */
module.exports.cancelBookingCtrl = expressAsyncHandler(async (req, res) => {
    // 1. Find booking
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
    }

    // 2. Update status to cancelled
    await Booking.findByIdAndUpdate(req.params.id, { status: 'cancelled' });

    // 3. Update room status to available
    await Room.findByIdAndUpdate(booking.room, { status: 'متاحة' });

    // 4. Send response
    res.status(200).json({ message: "Booking cancelled successfully." });
});