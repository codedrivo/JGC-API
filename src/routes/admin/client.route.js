const router = require("express").Router();
const clientController = require("../../controllers/admin/client.controller");
const auth = require("../../middlewares/auth.middleware");
const clientValidation = require("../../validators/admin/client.validator");
const validator = require("express-joi-validation").createValidator({
    passError: true,
});

router.use(auth("admin"));

/* ================= CREATE ================= */
router.post(
    "/add",
    validator.body(clientValidation.createClient),
    clientController.createClient
);

/* ================= LIST ================= */
router.post(
    "/list/:page/:limit",
    validator.params(clientValidation.pagination),
    clientController.listClient
);

/* ================= GET BY ID ================= */
router.get(
    "/:clientId",
    validator.params(clientValidation.singleId),
    clientController.getClientById
);

/* ================= UPDATE ================= */
router.put(
    "/update/:clientId",
    validator.params(clientValidation.singleId),
    validator.body(clientValidation.updateClient),
    clientController.updateClient
);

/* ================= DELETE ================= */
router.delete(
    "/delete/:clientId",
    validator.params(clientValidation.singleId),
    clientController.deleteClient
);
/* ================= Export ================= */
router.post(
    "/export",
    clientController.exportClients
);

/* ================= SUB USER ================= */

router.post(
    "/user/add/:clientId",
    validator.params(clientValidation.singleId),
    validator.body(clientValidation.createSubUser),
    clientController.addSubUser
);

router.post(
    "/user/list/:clientId/:page/:limit",
    clientController.listSubUsers
);

router.put(
    "/user/update/:userId",
    validator.params(clientValidation.singleId),
    validator.body(clientValidation.updateSubUser),
    clientController.updateSubUser
);

router.delete(
    "/user/delete/:userId",
    validator.params(clientValidation.singleId),
    clientController.deleteSubUser
);

module.exports = router;
