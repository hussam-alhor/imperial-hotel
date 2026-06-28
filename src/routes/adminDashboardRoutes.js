const express = require('express');
const router = express.Router();

const { verifyTokenAndOnlyAdmin } = require('../middlewares/verifyToken');

const { getAdminReportsCtrl } = require('../controllers/adminAnalyticsController');
const { getAdminInvoicesCtrl } = require('../controllers/adminInvoicesController');
const { getAdminAuditLogsCtrl } = require('../controllers/adminAuditLogsController');

router.get('/reports', verifyTokenAndOnlyAdmin, getAdminReportsCtrl);
router.get('/invoices', verifyTokenAndOnlyAdmin, getAdminInvoicesCtrl);
router.get('/audit-logs', verifyTokenAndOnlyAdmin, getAdminAuditLogsCtrl);

module.exports = router;

