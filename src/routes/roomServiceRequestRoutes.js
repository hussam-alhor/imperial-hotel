const express = require("express");
const router = express.Router();

const { verifyTokenAndEmployee } = require("../middlewares/verifyToken");
const { createRoomServiceRequestCtrl, getAllRoomServiceRequestsCtrl, getRoomServiceRequestByIdCtrl, updateRoomServiceRequestCtrl, deleteRoomServiceRequestCtrl } = require("../controllers/roomServiceRequestController");
const { validateObjectId } = require("../middlewares/validateObjectId");

// Routes for room service requests
router.route("/")
    .post(verifyTokenAndEmployee, createRoomServiceRequestCtrl)
    .get(verifyTokenAndEmployee, getAllRoomServiceRequestsCtrl);

router.route("/:id")
    .get(validateObjectId, verifyTokenAndEmployee, getRoomServiceRequestByIdCtrl)
    .put(validateObjectId, verifyTokenAndEmployee, updateRoomServiceRequestCtrl)
    .delete(validateObjectId, verifyTokenAndEmployee, deleteRoomServiceRequestCtrl);

module.exports = router;