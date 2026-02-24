const router = require("express").Router();
const auth = require("../../middlewares/auth.middleware");
const upload = require("../../middlewares/multerWithOutS3.middleware");
const controller = require("../../controllers/admin/report.controller");
const validator = require("express-joi-validation").createValidator({
    passError: true,
});
const validationSchema = require("../../validators/admin/report.validator");

router.use(auth("admin"));

router.post(
    "/publish-report",
    upload.single("file"),
    validator.body(validationSchema.publishReport),
    controller.publishReport
);

router.get(
    "/ingest-status/:id",
    controller.getIngestStatus
);

module.exports = router;