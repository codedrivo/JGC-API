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

        // From Judy API
        family: {
            type: String,
            required: true,
            trim: true,
        },

        year: {
            type: Number,
            required: true,
        },

        filename: {
            type: String,
            required: true,
        },

        reportFileUrl: {
            type: String, // s3_uri or converted https URL
            required: true,
        },

        // Optional: track upload status
        uploadStatus: {
            type: String,
            enum: ["uploaded", "failed"],
            default: "uploaded",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);