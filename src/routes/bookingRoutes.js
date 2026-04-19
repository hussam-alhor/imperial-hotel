const express = require("express");
const router = express.Router();

const { verifyTokenAndEmployee } = require("../middlewares/verifyToken");
const { createBookingCtrl, getAllBookingsCtrl, getBookingByIdCtrl, updateBookingCtrl, cancelBookingCtrl } = require("../controllers/bookingController");
const { validateObjectId } = require("../middlewares/validateObjectId");

// Routes for bookings
router.route("/")
    .post(verifyTokenAndEmployee, createBookingCtrl)
    .get(verifyTokenAndEmployee, getAllBookingsCtrl);

router.route("/:id")
    .get(validateObjectId, verifyTokenAndEmployee, getBookingByIdCtrl)
    .put(validateObjectId, verifyTokenAndEmployee, updateBookingCtrl)
    .delete(validateObjectId, verifyTokenAndEmployee, cancelBookingCtrl); // Cancel booking

module.exports = router;