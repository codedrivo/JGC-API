const axios = require("axios");
const FormData = require("form-data");
const Report = require("../../models/report.model");
const ReportType = require("../../models/reportType.model");
const ApiError = require('../../helpers/apiErrorConverter');

const publishReport = async (file, body) => {
    try {
        const { reportTypeId, publicationDate } = body;

        // Validate file
        if (!file) {
            throw new ApiError("File is required", 400);
        }
        const isPdf =
            file.mimetype === "application/pdf" &&
            file.originalname.toLowerCase().endsWith(".pdf");

        if (!isPdf) {
            throw new ApiError("Only PDF files are allowed", 400);
        }

        if (file.size > 5 * 1024 * 1024) {
            throw new ApiError("File exceeds 5MB limit", 400);
        }

        if (!reportTypeId || !publicationDate) {
            throw new ApiError("Report type and publication date are required", 400);
        }

        // ✅ Get ReportType
        const reportType = await ReportType.findById(reportTypeId);

        if (!reportType) {
            throw new ApiError("Invalid report type", 404);
        }

        if (!reportType.shortName) {
            throw new ApiError("Report type shortName not configured", 400);
        }

        // ✅ Extract family + year
        const family = reportType.shortName;

        const dateObj = new Date(publicationDate);
        if (isNaN(dateObj)) {
            throw new ApiError("Invalid publication date", 400);
        }

        const year = dateObj.getFullYear();

        // Prepare FormData
        const formData = new FormData();
        formData.append("family", family);
        formData.append("year", year);
        formData.append("file", file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype,
        });

        // Call Judy API
        const ingestResponse = await axios.post(
            `${process.env.JUDY_API}/api/upload/test-pdf`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                },
                auth: {
                    username: process.env.JUDY_USER,
                    password: process.env.JUDY_PASS,
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
            }
        );

        const { ok, filename, s3_uri } = ingestResponse.data;

        if (!ok || !s3_uri) {
            throw new ApiError("Judy upload failed", 502);
        }

        // Convert S3 URI to CloudFront URL
        const cloudfrontUrl = convertS3ToCloudFrontUrl(s3_uri);

        // Save to DB
        return Report.create({
            reportTypeId,
            publicationDate: dateObj,
            family,
            year,
            filename,
            reportFileUrl: cloudfrontUrl, // CDN URL (not raw S3)
            uploadStatus: "uploaded",
        });

    } catch (error) {
        console.log(error);

        throw new ApiError(
            error.message || "Judy API Error",
            500
        );
    }
};

const convertS3ToCloudFrontUrl = (s3Uri) => {
    if (!s3Uri) return null;

    const cloudfrontBase = process.env.CLOUDFRONT_URL;

    // Remove s3://bucket-name/
    const key = s3Uri.replace(/^s3:\/\/[^/]+\//, "");

    return `${cloudfrontBase}/${key}`;
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