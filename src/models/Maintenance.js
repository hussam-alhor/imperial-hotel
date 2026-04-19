const mongoose = require("mongoose");
const joi = require("joi");

const maintenanceSchema = new mongoose.Schema({
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ['scheduled', 'in_progress', 'completed'],
        default: 'scheduled',
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Joi validation for creating/updating maintenance
const validationCreateMaintenance = (obj) => {
    const schema = joi.object({
        room: joi.string().required(),
        startDate: joi.date().required(),
        endDate: joi.date().required(),
        description: joi.string().required().trim(),
        status: joi.string().valid('scheduled', 'in_progress', 'completed'),
    });
    return schema.validate(obj);
};

const validationUpdateMaintenance = (obj) => {
    const schema = joi.object({
        room: joi.string(),
        startDate: joi.date(),
        endDate: joi.date(),
        description: joi.string().trim(),
        status: joi.string().valid('scheduled', 'in_progress', 'completed'),
    });
    return schema.validate(obj);
};

module.exports = {
    Maintenance: mongoose.model("Maintenance", maintenanceSchema),
    validationCreateMaintenance,
    validationUpdateMaintenance,
};