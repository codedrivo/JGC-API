const ReportType = require('../models/reportType.model');

const getReportType = async (slug) => {
    return ReportType.find();
};
module.exports = {
    getReportType
};
