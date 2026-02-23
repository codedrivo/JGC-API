const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
    {
        reportTypeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ReportType",
            required: true,
        },
        publicationDate: {
            type: Date,
            required: true,
        },
        reportFileUrl: {
            type: String,
            required: true,
        },
        ingestJobId: {
            type: String,
            default: "",
        },
        ingestStatus: {
            type: String,
            enum: ["queued", "processing", "retrying", "succeeded", "failed"],
            default: "queued",
        },
        ingestAttempts: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);