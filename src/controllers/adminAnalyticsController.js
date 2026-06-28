const expressAsyncHandler = require('express-async-handler');

const { Booking } = require('../models/Booking');
const { Room } = require('../models/Room');
const { RoomServiceRequest } = require('../models/RoomServiceRequest');
const { Invoice } = require('../models/Invoice');
const { Maintenance } = require('../models/Maintenance');

/**
 * GET /api/dashboard/admin/reports
 * Revenue + bookings + maintenance breakdown
 */
module.exports.getAdminReportsCtrl = expressAsyncHandler(async (req, res) => {
  const range = req.query.range || 'today';

  const now = new Date();
  let start;
  let end = new Date(now);

  if (range === 'today') {
    start = new Date(now);
    start.setHours(0, 0, 0, 0);
  } else if (range === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
  } else {
    // last30
    start = new Date(now);
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);
  }

  // Revenue: sum of paidAmount for invoices updated/created in range.
  // (This system doesn't store payment dates separately in a dedicated field,
  // so we approximate by invoice createdAt.)
  const revenueAgg = await Invoice.aggregate([
    { $match: { createdAt: { $gte: start, $lt: end } } },
    { $group: { _id: null, totalPaid: { $sum: '$paidAmount' } } },
  ]);

  const revenue = revenueAgg[0]?.totalPaid || 0;

  // Bookings counts: today arrivals/ departures + upcoming
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const arrivalsToday = await Booking.countDocuments({
    checkInDate: { $gte: today, $lt: tomorrow },
    status: { $ne: 'cancelled' },
  });

  const departuresToday = await Booking.countDocuments({
    checkOutDate: { $gte: today, $lt: tomorrow },
    status: { $ne: 'cancelled' },
  });

  const upcomingBookings = await Booking.countDocuments({
    checkInDate: { $gte: tomorrow },
    status: { $ne: 'cancelled' },
  });

  // Maintenance breakdown
  const maintenanceBreakdown = await Maintenance.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  // Occupancy rate (optional)
  const totalRooms = await Room.countDocuments();
  const bookedRooms = await Room.countDocuments({ status: 'محجوز' });
  const occupancyRate = totalRooms > 0 ? bookedRooms / totalRooms : 0;

  const pendingRequests = await RoomServiceRequest.countDocuments({ status: 'pending' });

  res.status(200).json({
    range,
    revenue,
    bookings: {
      arrivalsToday,
      departuresToday,
      upcomingBookings,
    },
    maintenanceBreakdown: maintenanceBreakdown.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    occupancyRate,
    pendingRequests,
  });
});

