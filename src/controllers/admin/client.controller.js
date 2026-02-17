const catchAsync = require('../../helpers/asyncErrorHandler');
const service = require('../../services/admin/client.service');

/* ================= LIST CLIENTS ================= */
const listClient = catchAsync(async (req, res) => {
    const limit = req.params.limit ? Number(req.params.limit) : 10;
    const page = req.params.page ? Number(req.params.page) : 1;
    const status = req.body.status || '';
    const subscriptions = req.body.subscriptions || [];
    const search = req.body.search || '';

    const clients = await service.clientListFind(
        limit,
        page,
        search,
        status,
        subscriptions
    );

    res.status(200).json({ status: 200, clients });
});

/* ================= CREATE CLIENT ================= */
const createClient = catchAsync(async (req, res) => {
    const client = await service.createClient(req.body);
    res.status(200).json({
        status: 200,
        message: 'Client created successfully',
        client,
    });
});

/* ================= GET CLIENT ================= */
const getClientById = catchAsync(async (req, res) => {
    const client = await service.getClientById(req.params.clientId);
    const user = await service.listSubUsers(1, 20, req.params.clientId);
    res.status(200).json({
        status: 200,
        client,
        user
    });
});

/* ================= UPDATE CLIENT ================= */
const updateClient = catchAsync(async (req, res) => {
    const client = await service.updateClient(
        req.params.clientId,
        req.body
    );

    res.status(200).json({
        status: 200,
        message: 'Client updated successfully',
        client,
    });
});

/* ================= DELETE CLIENT ================= */
const deleteClient = catchAsync(async (req, res) => {
    await service.deleteClient(req.params.clientId);

    res.status(200).json({
        status: 200,
        message: 'Client deleted successfully',
    });
});

/* ================= EXPORT CLIENTS ================= */
const exportClients = catchAsync(async (req, res) => {
    const status = req.body.status || '';
    const subscriptions = req.body.subscriptions || [];
    const search = req.body.search || '';

    const workbook = await service.exportClients(
        search,
        status,
        subscriptions
    );

    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.setHeader(
        'Content-Disposition',
        'attachment; filename=clients.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
});

const addSubUser = catchAsync(async (req, res) => {
    const data = await service.addSubUser(
        req.params.clientId,
        req.body
    );
    res.status(200).json({ status: 200, data });
});

const listSubUsers = catchAsync(async (req, res) => {
    const { page, limit } = req.params;
    const data = await service.listSubUsers(
        page,
        limit,
        req.body.clientId
    );
    res.status(200).json({ status: 200, data });
});

const updateSubUser = catchAsync(async (req, res) => {
    const data = await service.updateSubUser(
        req.params.userId,
        req.body
    );
    res.status(200).json({ status: 200, data });
});

const deleteSubUser = catchAsync(async (req, res) => {
    await service.deleteSubUser(req.params.userId);
    res.status(200).json({ status: 200, message: "Deleted" });
});

module.exports = {
    listClient,
    createClient,
    getClientById,
    updateClient,
    deleteClient,
    exportClients,
    addSubUser,
    listSubUsers,
    updateSubUser,
    deleteSubUser

};
