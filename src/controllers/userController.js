const expressAsyncHandler = require("express-async-handler");
const { User, validationRegisterUser, validationUpdateUser } = require("../models/User");

/**
 * @route   POST /api/users/add-employee
 * @desc    Add a new employee (by Admin)
 * @access  Private (Only Admin)
 */
module.exports.addEmployeeCtrl = expressAsyncHandler(async (req, res) => {
    // 1. Validate user input
    const { error } = validationRegisterUser(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // 2. Check if user already exists
    let user = await User.findOne({ email: req.body.email });
    if (user) {
        return res.status(400).json({ message: "User with this email already exists" });
    }

    // 3. Create a new user (employee)
    user = await User.create({
        userName: req.body.userName,
        email: req.body.email,
        password: req.body.password,
    });

    // 4. Send response
    res.status(201).json({
        id: user._id,
        userName: user.userName,
        email: user.email,
        message: "employee account created successfully.",
    });
});

/**
 * @route   GET /api/users/employees
 * @desc    Get all employees
 * @access  Private (Only Admin)
 */
module.exports.getAllEmployeesCtrl = expressAsyncHandler(async (req, res) => {
    // جلب المستخدمين الذين ليسوا أدمن
    const employees = await User.find({ role: "Employee" }).select("-password");
    res.status(200).json(employees);
});

/**
 * @route   PUT /api/users/employee/:id
 * @desc    Update employee profile
 * @access  Private (Only Admin)
 */
module.exports.updateEmployeeCtrl = expressAsyncHandler(async (req, res) => {
    // 1. التحقق من البيانات المرسلة
    const { error } = validationUpdateUser(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // 2. البحث عن الموظف
    const employee = await User.findById(req.params.id);
    if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
    }

    // 3. تحديث البيانات
    employee.userName = req.body.userName;
    if (req.body.password) {
        employee.password = req.body.password; // سيتم hashing تلقائياً بسبب pre-save hook
    }

    // 4. حفظ التغييرات
    await employee.save();

    // 5. إرسال الرد بدون كلمة المرور
    res.status(200).json({
        id: employee._id,
        userName: employee.userName,
        email: employee.email,
        role: employee.role,
    });
});

/**
 * @route   DELETE /api/users/employee/:id
 * @desc    Delete an employee
 * @access  Private (Only Admin)
 */
module.exports.deleteEmployeeCtrl = expressAsyncHandler(async (req, res) => {
    // 1. البحث عن الموظف وحذفه
    const employee = await User.findById(req.params.id);
    if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
    }

    await User.findByIdAndDelete(req.params.id);

    // 2. إرسال الرد
    res.status(200).json({ message: "Employee account has been deleted successfully." });
});
