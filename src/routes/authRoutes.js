const express = require("express")
const { registerUserCtrl, loginUserCtrl } = require("../controllers/authController")
const router = express.Router()

// api/auth/login
router.route("/login")
    .post(loginUserCtrl)

module.exports = router