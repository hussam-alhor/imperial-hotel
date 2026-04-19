const mongoose = require("mongoose");
const joi = require("joi");

const cleaningScheduleSchema = new mongoose.Schema({
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true,
    },
    scheduledDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending',
    },
    notes: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Joi validation for creating/updating cleaning schedule
const validationCreateCleaningSchedule = (obj) => {
    const schema = joi.object({
        room: joi.string().required(),
        scheduledDate: joi.date().required(),
        status: joi.string().valid('pending', 'in_progress', 'completed'),
        notes: joi.string().trim(),
    });
    return schema.validate(obj);
};

const validationUpdateCleaningSchedule = (obj) => {
    const schema = joi.object({
        room: joi.string(),
        scheduledDate: joi.date(),
        status: joi.string().valid('pending', 'in_progress', 'completed'),
        notes: joi.string().trim(),
    });
    return schema.validate(obj);
};

module.exports = {
    CleaningSchedule: mongoose.model("CleaningSchedule", cleaningScheduleSchema),
    validationCreateCleaningSchedule,
    validationUpdateCleaningSchedule,
};