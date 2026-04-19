const express = require("express");
const router = express.Router();

const { verifyTokenAndOnlyAdmin } = require("../middlewares/verifyToken");
const { addEmployeeCtrl, getAllEmployeesCtrl, updateEmployeeCtrl, deleteEmployeeCtrl } = require("../controllers/userController");
const { validateObjectId } = require("../middlewares/validateObjectId");

// مسار إضافة طالب وجلب كل الطلاب
router.route("/employees")
    .post(verifyTokenAndOnlyAdmin, addEmployeeCtrl)
    .get(verifyTokenAndOnlyAdmin, getAllEmployeesCtrl);

// مسارات التحكم بطالب معين عن طريق الـ ID
router.route("/employee/:id")
    .put( validateObjectId ,verifyTokenAndOnlyAdmin, updateEmployeeCtrl)
    .delete(validateObjectId, verifyTokenAndOnlyAdmin, deleteEmployeeCtrl);

module.exports = router;
