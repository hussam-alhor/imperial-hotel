const expressAsyncHandler = require("express-async-handler");
const { Booking } = require("../models/Booking");
const { Room } = require("../models/Room");
const { RoomServiceRequest } = require("../models/RoomServiceRequest");
const { Invoice } = require("../models/Invoice");

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics for Admin/Employee
 * @access  Private
 */
module.exports.getDashboardStatsCtrl = expressAsyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. حساب الغرف بسرعة فائقة (داخل قاعدة البيانات)
    const stats = {
        totalRooms: await Room.countDocuments(),
        available: await Room.countDocuments({ status: 'متاحة' }),
        booked: await Room.countDocuments({ status: 'محجوز' }),
        maintenance: await Room.countDocuments({ status: 'تحت الصيانة' }),
        pendingRequests: await RoomServiceRequest.countDocuments({ status: 'pending' })
    };

    // 2. عمليات اليوم (وصول ومغادرة) - مهمة جداً للموظف
    const arrivalsToday = await Booking.find({ checkInDate: { $gte: today, $lt: tomorrow } }).populate('customer');
    const departuresToday = await Booking.find({ checkOutDate: { $gte: today, $lt: tomorrow } }).populate('customer');

    // 3. إحصائيات مالية للأدمن فقط
    let financialData = null;
    if (req.user.role === 'Admin') {
        const result = await Invoice.aggregate([{ $group: { _id: null, total: { $sum: "$paidAmount" } } }]);
        financialData = result[0]?.total || 0;
    }

    res.status(200).json({ stats, today: { arrivals: arrivalsToday, departures: departuresToday }, financialData });
});