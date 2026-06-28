
const expressAsyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const { Invoice, validationCreateInvoice, validationUpdateInvoice } = require("../models/Invoice");
const { Booking } = require("../models/Booking");
const { Room } = require("../models/Room");

/**
 * @route   POST /api/invoices
 * @desc    Create a new invoice with payments
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

    // 2. Validate input
    const { error } = validationCreateInvoice(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // 3. Check if booking exists
    const booking = await Booking.findById(req.body.booking).populate('customer').populate('room');
    if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
    }

    // 4. Calculate Amounts
    const baseAmount = booking.nights * booking.room.pricePerNight;
    const additionalChargesSum = (req.body.additionalCharges || []).reduce((sum, charge) => sum + charge.amount, 0);
    const discountsSum = (req.body.discounts || []).reduce((sum, discount) => sum + discount.amount, 0);
    
    const totalAmount = baseAmount + additionalChargesSum - discountsSum;
    const paidAmount = Number(req.body.paidAmount) || 0;
    const remainingAmount = totalAmount - paidAmount;

    // 5. Generate unique invoice number
    const uniqueSuffix = booking._id.toString().slice(-4).toUpperCase();
    const invoiceNumber = `INV-${uniqueSuffix}-${Date.now()}`;

    // 6. Create invoice object with structured payment record
    const invoiceData = {
        ...req.body,
        customer: req.body.customer || booking.customer._id,
        room: req.body.room || booking.room._id,
        totalAmount,
        remainingAmount,
        paidAmount,
        invoiceNumber,
        payments: req.body.payments || [{ 
            amount: paidAmount, 
            method: req.body.paymentMethod || 'كاش', 
            date: new Date() 
        }]
    };

    const invoice = await Invoice.create(invoiceData);

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
 * @desc    Update invoice (and recalculate amounts)
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

    // 3. Find existing invoice to recalculate logic
    const existingInvoice = await Invoice.findById(req.params.id).populate({
        path: 'booking',
        populate: { path: 'room' }
    });

    if (!existingInvoice) {
        return res.status(404).json({ message: "Invoice not found" });
    }

    // 4. Merge old data with new data to recalculate amounts
    const updatedAdditionalCharges = req.body.additionalCharges || existingInvoice.additionalCharges || [];
    const updatedDiscounts = req.body.discounts || existingInvoice.discounts || [];
    const updatedPaidAmount = req.body.paidAmount !== undefined ? req.body.paidAmount : existingInvoice.paidAmount;

    // 5. Recalculate
    const baseAmount = existingInvoice.booking.nights * existingInvoice.booking.room.pricePerNight;
    const additionalChargesSum = updatedAdditionalCharges.reduce((sum, charge) => sum + charge.amount, 0);
    const discountsSum = updatedDiscounts.reduce((sum, discount) => sum + discount.amount, 0);

    const newTotalAmount = baseAmount + additionalChargesSum - discountsSum;
    const newRemainingAmount = newTotalAmount - updatedPaidAmount;

    // 6. Update invoice
    const updatedInvoice = await Invoice.findByIdAndUpdate(
        req.params.id,
        { 
            $set: {
                ...req.body,
                totalAmount: newTotalAmount,
                paidAmount: updatedPaidAmount,
                remainingAmount: newRemainingAmount
            }
        },
        { new: true }
    ).populate('booking').populate('customer').populate('room');

    res.status(200).json(updatedInvoice);
});
/**
 * @route   POST /api/invoices/:id/checkout
 * @desc    Checkout and finalize invoice with state management
 * @access  Private (Employee or Admin)
 */
module.exports.checkoutCtrl = expressAsyncHandler(async (req, res) => {
    const invoiceId = req.params.id;
    const invoice = await Invoice.findById(invoiceId).populate('booking');

    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    
    // منع الخروج إذا كان هناك مبلغ متبقي
    if (invoice.remainingAmount > 0) {
        return res.status(400).json({ message: "يوجد مبلغ متبقي يجب سداده قبل إتمام عملية الـ Checkout" });
    }

    const roomId = invoice.booking.room;
    const session = await mongoose.startSession();
    
    try {
        await session.withTransaction(async () => {
            // 1. تحديث الحجز
            await Booking.findByIdAndUpdate(invoice.booking._id, { status: 'completed' }, { session });
            // 2. إخلاء الغرفة (التغيير إلى متاحة)
            await Room.findByIdAndUpdate(roomId, { status: 'متاحة' }, { session });
            // 3. تحديث الفاتورة
            await Invoice.findByIdAndUpdate(invoiceId, { status: 'paid' }, { session });
        });

        res.status(200).json({ message: "تمت عملية الـ Checkout بنجاح وتحديث حالة الغرفة" });
    } catch (error) {
        console.warn("Transaction failed, falling back to sequential execution:", error.message);
        
        // تنفيذ يدوي في حالة البيئة المحلية (Standalone DB)
        await Booking.findByIdAndUpdate(invoice.booking._id, { status: 'completed' });
        await Room.findByIdAndUpdate(roomId, { status: 'متاحة' });
        await Invoice.findByIdAndUpdate(invoiceId, { status: 'paid' });
        
        res.status(200).json({ message: "تمت العملية بنجاح (وضع التوافق المحلي)" });
    } finally {
        session.endSession();
    }
});