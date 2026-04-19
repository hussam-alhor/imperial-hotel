const express = require("express");
const router = express.Router();

const { verifyTokenAndEmployee } = require("../middlewares/verifyToken");
const { createCleaningScheduleCtrl, getAllCleaningSchedulesCtrl, getCleaningScheduleByIdCtrl, updateCleaningScheduleCtrl, deleteCleaningScheduleCtrl } = require("../controllers/cleaningScheduleController");
const { validateObjectId } = require("../middlewares/validateObjectId");

// Routes for cleaning schedules
router.route("/")
    .post(verifyTokenAndEmployee, createCleaningScheduleCtrl)
    .get(verifyTokenAndEmployee, getAllCleaningSchedulesCtrl);

router.route("/:id")
    .get(validateObjectId, verifyTokenAndEmployee, getCleaningScheduleByIdCtrl)
    .put(validateObjectId, verifyTokenAndEmployee, updateCleaningScheduleCtrl)
    .delete(validateObjectId, verifyTokenAndEmployee, deleteCleaningScheduleCtrl);

module.exports = router;