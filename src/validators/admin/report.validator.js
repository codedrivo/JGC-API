const Joi = require("joi");

const publishReport = Joi.object({
    reportTypeId: Joi.string().required(),
    publicationDate: Joi.date().required()
});

module.exports = {
    publishReport,
};