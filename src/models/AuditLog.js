const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true }, // مثال: "DELETE_BOOKING"
    details: { type: Object }, // بيانات العملية (رقم الحجز، الغرفة، إلخ)
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);