const expressAsyncHandler = require("express-async-handler");
const { Customer, validationCreateCustomer, validationUpdateCustomer } = require("../models/Customer");

/**
 * @route   POST /api/customers
 * @desc    Add a new customer
 * @access  Private (Employee or Admin)
 */
module.exports.addCustomerCtrl = expressAsyncHandler(async (req, res) => {
    // 1. Validate input
    const { error } = validationCreateCustomer(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // 2. Check if customer already exists by idNumber or email
    let customer = await Customer.findOne({ $or: [{ email: req.body.email }, { idNumber: req.body.idNumber }] });
    if (customer) {
        return res.status(400).json({ message: "Customer with this email or ID number already exists" });
    }

    // 3. Create new customer
    customer = await Customer.create(req.body);

    // 4. Send response
    res.status(201).json({
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        idNumber: customer.idNumber,
        message: "Customer created successfully.",
    });
});

/**
 * @route   GET /api/customers
 * @desc    Get all customers
 * @access  Private (Employee or Admin)
 */
module.exports.getAllCustomersCtrl = expressAsyncHandler(async (req, res) => {
    const customers = await Customer.find();
    res.status(200).json(customers);
});

/**
 * @route   GET /api/customers/:id
 * @desc    Get customer by ID
 * @access  Private (Employee or Admin)
 */
module.exports.getCustomerByIdCtrl = expressAsyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json(customer);
});

/**
 * @route   PUT /api/customers/:id
 * @desc    Update customer
 * @access  Private (Employee or Admin)
 */
module.exports.updateCustomerCtrl = expressAsyncHandler(async (req, res) => {
    // 1. Validate input
    const { error } = validationUpdateCustomer(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // 2. Update customer
    const updatedCustomer = await Customer.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
    );

    if (!updatedCustomer) {
        return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json(updatedCustomer);
});

/**
 * @route   DELETE /api/customers/:id
 * @desc    Delete customer
 * @access  Private (Employee or Admin)
 */
module.exports.deleteCustomerCtrl = expressAsyncHandler(async (req, res) => {
    // 1. Find and delete customer
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
    }

    await Customer.findByIdAndDelete(req.params.id);

    // 2. Send response
    res.status(200).json({ message: "Customer deleted successfully." });
});