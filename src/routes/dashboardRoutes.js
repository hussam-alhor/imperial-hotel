const express = require("express");
const router = express.Router();
const { verifyTokenAndEmployee } = require("../middlewares/verifyToken");
const { getDashboardStatsCtrl } = require("../controllers/dashboardController");

router.get("/stats", verifyTokenAndEmployee, getDashboardStatsCtrl);

module.exports = router;