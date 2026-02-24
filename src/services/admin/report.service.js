const axios = require("axios");
const FormData = require("form-data");
const Report = require("../../models/report.model");
const fs = require("fs");

const publishReport = async (req) => {
    const { reportTypeId, publicationDate, family, year } = req.body;
    const file = req.file;

    // 5MB
    if (file.size > 5 * 1024 * 1024) {
        throw new Error("File exceeds 5MB limit");
    }

    // Step 1: Prepare FormData for Judy
    const formData = new FormData();
    formData.append("family", family);
    formData.append("year", year);

    // Since using multer-s3, we need file from S3 location
    const fileStream = await axios.get(file.location, {
        responseType: "stream",
    });

    formData.append("file", fileStream.data, file.originalname);

    // Step 2: Call Ask Judy async ingest API
    const ingestResponse = await axios.post(
        `${process.env.JUDY_API}/api/upload/test-pdf`,
        formData,
        {
            headers: formData.getHeaders(),
            auth: {
                username: process.env.JUDY_USER,
                password: process.env.JUDY_PASS,
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        }
    );

    const { job_id, status } = ingestResponse.data;

    // Step 3: Save report
    const report = await Report.create({
        reportTypeId,
        publicationDate,
        reportFileUrl: file.location,
        ingestJobId: job_id,
        ingestStatus: status,
    });

    return report;
};

const getIngestStatus = async (reportId) => {
    const report = await Report.findById(reportId);
    if (!report || !report.ingestJobId) {
        throw new Error("Ingest job not found");
    }
    const response = await axios.get(
        `${process.env.JUDY_API}/api/ingest/jobs/${report.ingestJobId}`,
        {
            auth: {
                username: process.env.JUDY_USER,
                password: process.env.JUDY_PASS,
            },
        }
    );

    const jobData = response.data;

    // update DB
    report.ingestStatus = jobData.status;
    report.ingestAttempts = jobData.attempt;
    await report.save();

    return jobData;
};

module.exports = {
    publishReport,
    getIngestStatus,
};