// seeds/reportType.seed.js
const ReportType = require("../models/reportType.model");

const DEFAULT_REPORT_TYPES = [
  {
    label: "Beyond the Headlines",
    description: "Macro and market overview"
  },
  {
    label: "Softs In-Depth Report",
    description: "Detailed analysis of soft commodities"
  },
  {
    label: "Softs Weekly Report",
    description: "Weekly soft commodities summary"
  },
  {
    label: "Coffee In-Depth Report",
    description: "Detailed coffee market analysis"
  },
  {
    label: "Coffee Weekly Report",
    description: "Weekly coffee market summary"
  }
];

async function seedReportTypes() {
  for (const type of DEFAULT_REPORT_TYPES) {
    await ReportType.updateOne(
      { label: type.label },   // prevent duplicates
      { $setOnInsert: type },
      { upsert: true }
    );
  }

  console.log("Report types seeded");
}

module.exports = seedReportTypes;
