const mongoose = require("mongoose");
const joi = require("joi");

const roomServiceRequestSchema = new mongoose.Schema({
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
    },
    requestType: {
        type: String,
        required: true,
        enum: ['cleaning', 'maintenance', 'supplies', 'other'],
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending',
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Joi validation for creating/updating room service request
const validationCreateRoomServiceRequest = (obj) => {
    const schema = joi.object({
        room: joi.string().required(),
        customer: joi.string(),
        requestType: joi.string().valid('cleaning', 'maintenance', 'supplies', 'other').required(),
        description: joi.string().required().trim(),
        status: joi.string().valid('pending', 'in_progress', 'completed'),
        priority: joi.string().valid('low', 'medium', 'high'),
    });
    return schema.validate(obj);
};

const validationUpdateRoomServiceRequest = (obj) => {
    const schema = joi.object({
        room: joi.string(),
        customer: joi.string(),
        requestType: joi.string().valid('cleaning', 'maintenance', 'supplies', 'other'),
        description: joi.string().trim(),
        status: joi.string().valid('pending', 'in_progress', 'completed'),
        priority: joi.string().valid('low', 'medium', 'high'),
    });
    return schema.validate(obj);
};

module.exports = {
    RoomServiceRequest: mongoose.model("RoomServiceRequest", roomServiceRequestSchema),
    validationCreateRoomServiceRequest,
    validationUpdateRoomServiceRequest,
};