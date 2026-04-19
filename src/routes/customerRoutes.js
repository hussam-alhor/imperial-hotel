const express = require("express");
const router = express.Router();

const { verifyTokenAndEmployee } = require("../middlewares/verifyToken");
const { addCustomerCtrl, getAllCustomersCtrl, getCustomerByIdCtrl, updateCustomerCtrl, deleteCustomerCtrl } = require("../controllers/customerController");
const { validateObjectId } = require("../middlewares/validateObjectId");

// Routes for customers
router.route("/")
    .post(verifyTokenAndEmployee, addCustomerCtrl)
    .get(verifyTokenAndEmployee, getAllCustomersCtrl);

router.route("/:id")
    .get(validateObjectId, verifyTokenAndEmployee, getCustomerByIdCtrl)
    .put(validateObjectId, verifyTokenAndEmployee, updateCustomerCtrl)
    .delete(validateObjectId, verifyTokenAndEmployee, deleteCustomerCtrl);

module.exports = router;