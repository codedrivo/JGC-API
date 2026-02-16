const Joi = require("joi");

/* ================= PAGINATION ================= */
const pagination = Joi.object({
    page: Joi.number().required(),
    limit: Joi.number().optional(),
});

/* ================= SINGLE ID ================= */
const singleId = Joi.object({
    clientId: Joi.string().required(),
});

/* ================= REPORT ACCESS ================= */
const reportAccessSchema = Joi.object({
    reportTypeId: Joi.string().required(),
    startDate: Joi.date().required(),
    viewDate: Joi.date().required(),
    endDate: Joi.date().required(),
});

/* ================= CREATE CLIENT ================= */
const createClient = Joi.object({
    companyName: Joi.string().trim().required(),
    customerID: Joi.string().trim().required(),

    clientLevel: Joi.string()
        .valid("SINGLE", "UP_TO_3", "ENTERPRISE")
        .required(),

    clientStatus: Joi.string()
        .valid("ACTIVE", "INACTIVE")
        .default("ACTIVE"),

    firstName: Joi.string().trim().required(),

    email: Joi.string().email().required(),

    reportAccess: Joi.array()
        .items(reportAccessSchema)
        .default([]),
});

/* ================= UPDATE CLIENT ================= */
const updateClient = Joi.object({
    companyName: Joi.string().trim().optional(),
    customerID: Joi.string().trim().optional(),

    clientLevel: Joi.string()
        .valid("SINGLE", "UP_TO_3", "ENTERPRISE")
        .optional(),

    clientStatus: Joi.string()
        .valid("ACTIVE", "INACTIVE")
        .optional(),

    firstName: Joi.string().trim().optional(),
    email: Joi.string().email().optional(),

    reportAccess: Joi.array()
        .items(reportAccessSchema)
        .optional(),
}).min(1); // at least one field required


const createSubUser = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    positionTitle: Joi.string().required(),
});

const updateSubUser = Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    positionTitle: Joi.string(),
    status: Joi.string().valid("active", "inactive"),
});

module.exports = {
    pagination,
    singleId,
    createClient,
    updateClient,
    createSubUser,
    updateSubUser
};
