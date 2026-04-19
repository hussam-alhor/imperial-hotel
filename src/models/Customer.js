const mongoose = require("mongoose");
const joi = require("joi");

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    idNumber: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Joi validation for creating/updating customer
const validationCreateCustomer = (obj) => {
    const schema = joi.object({
        name: joi.string().required().trim().min(2).max(100),
        email: joi.string().email().required().trim().lowercase(),
        phone: joi.string().required().trim(),
        idNumber: joi.string().required().trim(),
    });
    return schema.validate(obj);
};

const validationUpdateCustomer = (obj) => {
    const schema = joi.object({
        name: joi.string().trim().min(2).max(100),
        email: joi.string().email().trim().lowercase(),
        phone: joi.string().trim(),
        idNumber: joi.string().trim(),
    });
    return schema.validate(obj);
};

module.exports = {
    Customer: mongoose.model("Customer", customerSchema),
    validationCreateCustomer,
    validationUpdateCustomer,
};