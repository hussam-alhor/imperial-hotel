const express = require("express");
const router = express.Router();

const { verifyTokenAndEmployee } = require("../middlewares/verifyToken");
const { createMaintenanceCtrl, getAllMaintenancesCtrl, getMaintenanceByIdCtrl, updateMaintenanceCtrl, deleteMaintenanceCtrl } = require("../controllers/maintenanceController");
const { validateObjectId } = require("../middlewares/validateObjectId");

// Routes for maintenances
router.route("/")
    .post(verifyTokenAndEmployee, createMaintenanceCtrl)
    .get(verifyTokenAndEmployee, getAllMaintenancesCtrl);

router.route("/:id")
    .get(validateObjectId, verifyTokenAndEmployee, getMaintenanceByIdCtrl)
    .put(validateObjectId, verifyTokenAndEmployee, updateMaintenanceCtrl)
    .delete(validateObjectId, verifyTokenAndEmployee, deleteMaintenanceCtrl);

module.exports = router;