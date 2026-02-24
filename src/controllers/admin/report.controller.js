const catchAsync = require("../../helpers/asyncErrorHandler");
const service = require("../../services/admin/report.service");

const publishReport = catchAsync(async (req, res) => {
    const report = await service.publishReport(req);
    res.status(200).json({
        status: 200,
        message: "Report uploaded successfully",
        data: report,
    });
});

const getIngestStatus = catchAsync(async (req, res) => {
    const result = await service.getIngestStatus(req.params.id);
    res.status(200).json({
        status: 200,
        data: result,
    });
});

module.exports = {
    publishReport,
    getIngestStatus,
};