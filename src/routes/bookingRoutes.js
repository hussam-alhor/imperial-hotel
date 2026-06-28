const express = require("express");
const router = express.Router();
const { logAction } = require("../middlewares/auditLogger");

const { verifyTokenAndEmployee } = require("../middlewares/verifyToken");
const { createBookingCtrl, getAllBookingsCtrl, getBookingByIdCtrl, updateBookingCtrl, cancelBookingCtrl } = require("../controllers/bookingController");
const { validateObjectId } = require("../middlewares/validateObjectId");

// Routes for bookings
router.route("/")
    .post(verifyTokenAndEmployee, logAction("CREATE_BOOKING"), createBookingCtrl)
    .get(verifyTokenAndEmployee, getAllBookingsCtrl);

router.route("/:id")
    .get(validateObjectId, verifyTokenAndEmployee, getBookingByIdCtrl)
    .put(validateObjectId, verifyTokenAndEmployee, logAction("UPDATE_BOOKING"), updateBookingCtrl)
    .delete(validateObjectId, verifyTokenAndEmployee, logAction("CANCEL_BOOKING"), cancelBookingCtrl); // Cancel booking

module.exports = router;