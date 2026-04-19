const mongoose = require("mongoose");
const joi = require("joi");

const invoiceSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    paidAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    remainingAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    payments: [{
        amount: { type: Number, required: true },
        method: { type: String, enum: ['كاش', 'بطاقة ائتمان', 'دفع إلكتروني', 'أخرى'], required: true },
        date: { type: Date, default: Date.now },
    }],
    discounts: [{
        description: { type: String, trim: true },
        amount: { type: Number, min: 0 },
    }],
    additionalCharges: [{
        description: { type: String, trim: true },
        amount: { type: Number, min: 0 },
    }],
    status: {
        type: String,
        enum: ['pending', 'paid', 'partially_paid'],
        default: 'pending',
    },
    invoiceNumber: {
        type: String,
        unique: true,
        required: true,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Joi validation for creating/updating invoice
const validationCreateInvoice = (obj) => {
    const schema = joi.object({
        booking: joi.string().required(),
        customer: joi.string(),  // Optional, will be taken from booking
        room: joi.string(),      // Optional, will be taken from booking
        totalAmount: joi.number().min(0),  // Optional, will be calculated if not provided
        paidAmount: joi.number().min(0),
        remainingAmount: joi.number().min(0),
        payments: joi.array().items(joi.object({
            amount: joi.number().required(),
            method: joi.string().valid('كاش', 'بطاقة ائتمان', 'دفع إلكتروني', 'أخرى').required(),
            date: joi.date(),
        })),
        discounts: joi.array().items(joi.object({
            description: joi.string().trim(),
            amount: joi.number().min(0),
        })),
        additionalCharges: joi.array().items(joi.object({
            description: joi.string().trim(),
            amount: joi.number().min(0),
        })),
        status: joi.string().valid('pending', 'paid', 'partially_paid'),
        invoiceNumber: joi.string(),  // Will be generated
    });
    return schema.validate(obj);
};

const validationUpdateInvoice = (obj) => {
    const schema = joi.object({
        totalAmount: joi.number().min(0),
        paidAmount: joi.number().min(0),
        remainingAmount: joi.number().min(0),
        payments: joi.array().items(joi.object({
            amount: joi.number().required(),
            method: joi.string().valid('كاش', 'بطاقة ائتمان', 'دفع إلكتروني', 'أخرى').required(),
            date: joi.date(),
        })),
        discounts: joi.array().items(joi.object({
            description: joi.string().trim(),
            amount: joi.number().min(0),
        })),
        additionalCharges: joi.array().items(joi.object({
            description: joi.string().trim(),
            amount: joi.number().min(0),
        })),
        status: joi.string().valid('pending', 'paid', 'partially_paid'),
    });
    return schema.validate(obj);
};

module.exports = {
    Invoice: mongoose.model("Invoice", invoiceSchema),
    validationCreateInvoice,
    validationUpdateInvoice,
};