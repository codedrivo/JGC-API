const router = require('express').Router();
const controller = require('../../controllers/admin/user.controller');
const auth = require('../../middlewares/auth.middleware');
const upload = require('../../middlewares/multer.middleware');
const validationSchema = require('../../validators/admin/user.validator');
const validator = require('express-joi-validation').createValidator({
  passError: true,
});

router.use(auth('admin'));

/* ================= LIST ================= */
router.post(
  "/list/:page/:limit",
  validator.params(validationSchema.pagination),
  controller.listUser
);

/* ================= Export ================= */
router.post(
  "/export",
  controller.exportUsers
);


module.exports = router;
