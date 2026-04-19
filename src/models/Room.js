const mongoose = require("mongoose");
const joi = require("joi");

const roomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['فردية', 'مزدوجة', 'جناح', 'عائلية', 'أخرى'], // single, double, suite, family, other
    },
    pricePerNight: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        required: true,
        enum: ['متاحة', 'محجوز', 'تحت الصيانة'], // available, booked, under maintenance
        default: 'متاحة',
    },
    category: {
        type: String,
        required: true,
        enum: ['اقتصادي', 'فاخر', 'رجال أعمال', 'جناح رئيسي'], // economy, luxury, business, presidential suite
    },
    amenities: [{
        type: String,
        trim: true,
    }],
    images: [{
        type: String,
        trim: true,
    }],
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Joi validation for creating/updating room
const validationCreateRoom = (obj) => {
    const schema = joi.object({
        roomNumber: joi.string().required().trim(),
        type: joi.string().valid('فردية', 'مزدوجة', 'جناح', 'عائلية', 'أخرى').required(),
        pricePerNight: joi.number().min(0).required(),
        status: joi.string().valid('متاحة', 'محجوز', 'تحت الصيانة'),
        category: joi.string().valid('اقتصادي', 'فاخر', 'رجال أعمال', 'جناح رئيسي').required(),
        amenities: joi.array().items(joi.string().trim()),
        images: joi.array().items(joi.string().trim()),
    });
    return schema.validate(obj);
};

const validationUpdateRoom = (obj) => {
    const schema = joi.object({
        roomNumber: joi.string().trim(),
        type: joi.string().valid('فردية', 'مزدوجة', 'جناح', 'عائلية', 'أخرى'),
        pricePerNight: joi.number().min(0),
        status: joi.string().valid('متاحة', 'محجوز', 'تحت الصيانة'),
        category: joi.string().valid('اقتصادي', 'فاخر', 'رجال أعمال', 'جناح رئيسي'),
        amenities: joi.array().items(joi.string().trim()),
        images: joi.array().items(joi.string().trim()),
    });
    return schema.validate(obj);
};

module.exports = {
    Room: mongoose.model("Room", roomSchema),
    validationCreateRoom,
    validationUpdateRoom,
};