const expressAsyncHandler = require("express-async-handler");
const { Invoice, validationCreateInvoice, validationUpdateInvoice } = require("../models/Invoice");
const { Booking } = require("../models/Booking");
const { Room } = require("../models/Room");

/**
 * @route   POST /api/invoices
 * @desc    Create a new invoice
 * @access  Private (Employee or Admin)
 */
module.exports.createInvoiceCtrl = expressAsyncHandler(async (req, res) => {
    // 1. Parse arrays if strings
    ['payments', 'discounts', 'additionalCharges'].forEach(field => {
        if (req.body[field] && typeof req.body[field] === 'string') {
            try {
                req.body[field] = JSON.parse(req.body[field]);
            } catch (e) {
                return res.status(400).json({ message: `Invalid ${field} format` });
            }
        }
    });

    // 2. Validate input (without totalAmount if not provided)
    const { error } = validationCreateInvoice(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // 3. Check if booking exists
    const booking = await Booking.findById(req.body.booking).populate('customer').populate('room');
    if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
    }

    // 4. Set customer and room from booking if not provided
    const customer = req.body.customer || booking.customer._id.toString();
    const room = req.body.room || booking.room._id.toString();

    // 4. Calculate totalAmount if not provided
    let totalAmount = req.body.totalAmount;
    if (!totalAmount) {
        const baseAmount = booking.nights * booking.room.pricePerNight;
        const additionalChargesSum = (req.body.additionalCharges || []).reduce((sum, charge) => sum + charge.amount, 0);
        const discountsSum = (req.body.discounts || []).reduce((sum, discount) => sum + discount.amount, 0);
        totalAmount = baseAmount + additionalChargesSum - discountsSum;
    }

    // 5. Calculate remainingAmount
    const paidAmount = req.body.paidAmount || 0;
    const remainingAmount = totalAmount - paidAmount;

    // 6. Generate invoice number
    const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
    const invoiceNumber = lastInvoice ? `INV${parseInt(lastInvoice.invoiceNumber.slice(3)) + 1}` : 'INV1';

    // 7. Create invoice
    const invoiceData = {
        ...req.body,
        customer,
        room,
        totalAmount,
        remainingAmount,
        paidAmount,
        invoiceNumber
    };
    const invoice = await Invoice.create(invoiceData);

    // 8. Send response
    res.status(201).json({
        id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: invoice.totalAmount,
        paidAmount: invoice.paidAmount,
        remainingAmount: invoice.remainingAmount,
        status: invoice.status,
        message: "Invoice created successfully.",
    });
});

/**
 * @route   GET /api/invoices
 * @desc    Get all invoices
 * @access  Private (Employee or Admin)
 */
module.exports.getAllInvoicesCtrl = expressAsyncHandler(async (req, res) => {
    const invoices = await Invoice.find().populate('booking').populate('customer').populate('room');
    res.status(200).json(invoices);
});

/**
 * @route   GET /api/invoices/:id
 * @desc    Get invoice by ID
 * @access  Private (Employee or Admin)
 */
module.exports.getInvoiceByIdCtrl = expressAsyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id).populate('booking').populate('customer').populate('room');
    if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
    }
    res.status(200).json(invoice);
});

/**
 * @route   PUT /api/invoices/:id
 * @desc    Update invoice
 * @access  Private (Employee or Admin)
 */
module.exports.updateInvoiceCtrl = expressAsyncHandler(async (req, res) => {
    // 1. Parse arrays if strings
    ['payments', 'discounts', 'additionalCharges'].forEach(field => {
        if (req.body[field] && typeof req.body[field] === 'string') {
            try {
                req.body[field] = JSON.parse(req.body[field]);
            } catch (e) {
                return res.status(400).json({ message: `Invalid ${field} format` });
            }
        }
    });

    // 2. Validate input
    const { error } = validationUpdateInvoice(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // 3. Update invoice
    const updatedInvoice = await Invoice.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
    ).populate('booking').populate('customer').populate('room');

    if (!updatedInvoice) {
        return res.status(404).json({ message: "Invoice not found" });
    }

    res.status(200).json(updatedInvoice);
});

/**
 * @route   POST /api/invoices/:id/checkout
 * @desc    Checkout and finalize invoice
 * @access  Private (Employee or Admin)
 */
module.exports.checkoutCtrl = expressAsyncHandler(async (req, res) => {
    // 1. Find invoice with booking and room
    const invoice = await Invoice.findById(req.params.id).populate('booking').populate('room');
    if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
    }

    if (!invoice.booking) {
        return res.status(400).json({ message: "Invoice is not linked to a booking" });
    }

    const roomId = invoice.room ? invoice.room._id : invoice.booking.room;

    // 2. Update booking status to completed
    await Booking.findByIdAndUpdate(invoice.booking._id, { status: 'completed' });

    // 3. Always free the room after checkout, since the booking is completed
    await Room.findByIdAndUpdate(roomId, { status: 'متاحة' });

    // 4. Update invoice status to paid
    await Invoice.findByIdAndUpdate(req.params.id, { status: 'paid' });

    // 5. Send response
    res.status(200).json({
        message: "Checkout completed successfully. Invoice finalized.",
        invoice: invoice,
    });
});