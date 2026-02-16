const router = require('express').Router();
const reportTypecontroller = require('../controllers/reportType.controller');

router.get(
    '/get',
    reportTypecontroller.getReportType,
);
module.exports = router;