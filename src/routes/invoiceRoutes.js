const express = require("express");
const router = express.Router();

const { verifyTokenAndEmployee } = require("../middlewares/verifyToken");
const { createInvoiceCtrl, getAllInvoicesCtrl, getInvoiceByIdCtrl, updateInvoiceCtrl, checkoutCtrl } = require("../controllers/invoiceController");
const { validateObjectId } = require("../middlewares/validateObjectId");

// Routes for invoices
router.route("/")
    .post(verifyTokenAndEmployee, createInvoiceCtrl)
    .get(verifyTokenAndEmployee, getAllInvoicesCtrl);

router.route("/:id")
    .get(validateObjectId, verifyTokenAndEmployee, getInvoiceByIdCtrl)
    .put(validateObjectId, verifyTokenAndEmployee, updateInvoiceCtrl);

router.post("/:id/checkout", validateObjectId, verifyTokenAndEmployee, checkoutCtrl);

module.exports = router;