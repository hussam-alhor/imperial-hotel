const express = require("express");
const router = express.Router();

const { verifyTokenAndEmployee } = require("../middlewares/verifyToken");
const { addRoomCtrl, getAllRoomsCtrl, getRoomByIdCtrl, updateRoomCtrl, deleteRoomCtrl } = require("../controllers/roomController");
const { validateObjectId } = require("../middlewares/validateObjectId");
const upload = require("../middlewares/uploadImage");

// Routes for rooms
router.route("/")
    .post(verifyTokenAndEmployee, upload.array('images', 10), addRoomCtrl)
    .get(verifyTokenAndEmployee, getAllRoomsCtrl);

router.route("/:id")
    .get(validateObjectId, verifyTokenAndEmployee, getRoomByIdCtrl)
    .put(validateObjectId, verifyTokenAndEmployee, upload.array('images', 10), updateRoomCtrl)
    .delete(validateObjectId, verifyTokenAndEmployee, deleteRoomCtrl);

module.exports = router;