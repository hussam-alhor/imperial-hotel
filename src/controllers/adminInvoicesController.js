const expressAsyncHandler = require('express-async-handler');
const { Invoice } = require('../models/Invoice');

/**
 * GET /api/dashboard/admin/invoices
 * Summary + list with filters
 */
module.exports.getAdminInvoicesCtrl = expressAsyncHandler(async (req, res) => {
  const { paid, startDate, endDate } = req.query;

  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
  const skip = (page - 1) * limit;

  const match = {};

  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  if (paid === 'paid') {
    match.status = 'paid';
  } else if (paid === 'unpaid') {
    match.status = { $in: ['pending', 'partially_paid'] };
  }

  const [totalCount, invoices, summary] = await Promise.all([
    Invoice.countDocuments(match),
    Invoice.find(match)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('booking')
      .populate('customer')
      .populate('room'),
    Invoice.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalPaid: { $sum: '$paidAmount' },
          totalPending: { $sum: '$remainingAmount' },
        },
      },
    ]),
  ]);

  const summaryObj = summary[0] || { totalPaid: 0, totalPending: 0 };

  res.status(200).json({
    page,
    limit,
    totalCount,
    summary: {
      totalPaid: summaryObj.totalPaid || 0,
      totalPending: summaryObj.totalPending || 0,
    },
    invoices,
  });
});

