// models/reportType.model.js
const mongoose = require("mongoose");

const reportTypeSchema = new mongoose.Schema(
    {
        label: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("ReportType", reportTypeSchema);
