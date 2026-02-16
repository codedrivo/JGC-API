const catchAsync = require('../helpers/asyncErrorHandler');
const reportTypeService = require('../services/reportType.service');

const getReportType = catchAsync(async (req, res) => {
    const reportTypeData = await reportTypeService.getReportType(req.params.slug);
    res.status(200).json({
        reportTypeData: reportTypeData,
    });
});
module.exports = {
    getReportType
};