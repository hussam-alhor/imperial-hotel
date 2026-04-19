const mongoose = require("mongoose");
const joi = require("joi");

const bookingSchema = new mongoose.Schema({
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
    checkInDate: {
        type: Date,
        required: true,
    },
    checkOutDate: {
        type: Date,
        required: true,
    },
    nights: {
        type: Number,
        required: true,
        min: 1,
    },
    initialPayment: {
        type: Number,
        required: true,
        min: 0,
    },
    specialRequests: [{
        type: String,
        trim: true,
    }],
    status: {
        type: String,
        enum: ['active', 'cancelled', 'completed'],
        default: 'active',
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Joi validation for creating/updating booking
const validationCreateBooking = (obj) => {
    const schema = joi.object({
        customer: joi.string().required(), // ObjectId as string
        room: joi.string().required(),
        checkInDate: joi.date().required(),
        checkOutDate: joi.date().required(),
        nights: joi.number().min(1).required(),
        initialPayment: joi.number().min(0).required(),
        specialRequests: joi.array().items(joi.string().trim()),
        status: joi.string().valid('active', 'cancelled', 'completed'),
    });
    return schema.validate(obj);
};

const validationUpdateBooking = (obj) => {
    const schema = joi.object({
        customer: joi.string(),
        room: joi.string(),
        checkInDate: joi.date(),
        checkOutDate: joi.date(),
        nights: joi.number().min(1),
        initialPayment: joi.number().min(0),
        specialRequests: joi.array().items(joi.string().trim()),
        status: joi.string().valid('active', 'cancelled', 'completed'),
    });
    return schema.validate(obj);
};

module.exports = {
    Booking: mongoose.model("Booking", bookingSchema),
    validationCreateBooking,
    validationUpdateBooking,
};