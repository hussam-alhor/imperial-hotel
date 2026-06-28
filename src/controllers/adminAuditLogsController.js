const expressAsyncHandler = require('express-async-handler');
const AuditLog = require('../models/AuditLog');

/**
 * GET /api/dashboard/admin/audit-logs
 * filters: userId, action, startDate, endDate, page, limit
 */
module.exports.getAdminAuditLogsCtrl = expressAsyncHandler(async (req, res) => {
  const { userId, action, startDate, endDate } = req.query;

  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
  const skip = (page - 1) * limit;

  const match = {};
  if (userId) match.user = userId;
  if (action) match.action = new RegExp(action, 'i');

  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }

  const [totalCount, logs] = await Promise.all([
    AuditLog.countDocuments(match),
    AuditLog.find(match)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name userName email role'),
  ]);

  res.status(200).json({
    page,
    limit,
    totalCount,
    logs,
  });
});

