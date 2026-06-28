const AuditLog = require("../models/AuditLog");

module.exports.logAction = (action) => async (req, res, next) => {
    try {
        await AuditLog.create({
            user: req.user.id,
            action: action,
            details: { params: req.params, body: req.body }
        });
        next();
    } catch (error) {
        next(); // لا نوقف الطلب إذا فشل السجل
    }
};