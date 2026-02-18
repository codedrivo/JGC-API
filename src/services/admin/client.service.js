const Client = require('../../models/user.model');
const ApiError = require('../../helpers/apiErrorConverter');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const ExcelJS = require("exceljs");
const email = require('../email/email.service');

/* ================= PASSWORD GENERATOR ================= */
const generatePassword = () => {
    return Math.random().toString(36).slice(-8) + '@1A';
};

/* ================= LIST CLIENTS ================= */
const clientListFind = async (
    limit = 10,
    page = 1,
    search = '',
    status = '',
    subscriptions = []
) => {
    try {
        const query = { role: 'client' };

        /* SEARCH */
        if (search) {
            const sanitized = search.replace(/"/g, '');
            query.$or = [
                { companyName: { $regex: sanitized, $options: 'i' } },
                { email: { $regex: sanitized, $options: 'i' } },
                { customerID: { $regex: sanitized, $options: 'i' } },
            ];
        }

        /* STATUS FILTER */
        if (status && status !== 'All') {
            query.clientStatus = status;
        }

        /* SUBSCRIPTION FILTER (reportTypeId) */
        if (subscriptions.length) {
            query['reportAccess.reportTypeId'] = {
                $in: subscriptions.map((id) => new mongoose.Types.ObjectId(id)),
            };
        }

        const skip = (page - 1) * limit;
        const totalItems = await Client.countDocuments(query);

        const clients = await Client.find(query)
            .populate('reportAccess.reportTypeId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return {
            clients,
            page,
            limit,
            totalPages: Math.ceil(totalItems / limit),
            totalResults: totalItems,
        };
    } catch (e) {
        throw new ApiError(e.message, 400);
    }
};
/* ================= CREATE CLIENT ================= */
const createClient = async (data) => {
    const password = generatePassword();
    const client = await Client.create({
        ...data,
        role: 'client',
        password: password,
    });

    await email.sendSendgridEmail(
        client.email,
        'Your Client Account',
        { email: client.email, pass: password },
        'd-38ddd55afb7e47d994f7f73ca1027050',
    );
    return client;
};

/* ================= GET CLIENT ================= */
const getClientById = async (id) => {
    const client = await Client.findOne({
        _id: id,
        role: 'client',
    });

    if (!client) throw new ApiError('Client not found', 404);
    return client;
};

/* ================= UPDATE CLIENT ================= */
const updateClient = async (id, data) => {
    const client = await Client.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id), role: 'client' },
        data,
        { new: true }
    );

    if (!client) throw new ApiError('Client not found', 404);
    return client;
};

/* ================= DELETE CLIENT ================= */
const deleteClient = async (id) => {
    const client = await Client.findOneAndDelete({
        _id: id,
        role: 'client',
    });

    if (!client) throw new ApiError('Client not found', 404);
};


/* ================= EXPORT CLIENTS ================= */
const exportClients = async (
    search = '',
    status = '',
    subscriptions = []
) => {
    try {
        const query = { role: 'client' };

        /* SEARCH */
        if (search) {
            const sanitized = search.replace(/"/g, '');
            query.$or = [
                { companyName: { $regex: sanitized, $options: 'i' } },
                { email: { $regex: sanitized, $options: 'i' } },
                { customerID: { $regex: sanitized, $options: 'i' } },
            ];
        }

        /* STATUS */
        if (status && status !== 'All') {
            query.clientStatus = status;
        }

        /* SUBSCRIPTIONS */
        if (subscriptions.length) {
            query['reportAccess.reportTypeId'] = {
                $in: subscriptions.map(
                    (id) => new mongoose.Types.ObjectId(id)
                ),
            };
        }

        const clients = await Client.find(query)
            .populate('reportAccess.reportTypeId')
            .sort({ createdAt: -1 });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Clients');

        worksheet.columns = [
            { header: 'Company', key: 'companyName', width: 25 },
            { header: 'Contact Name', key: 'firstName', width: 20 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Subscription', key: 'subscription', width: 30 },
            { header: 'License', key: 'license', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
        ];

        clients.forEach((client) => {
            worksheet.addRow({
                companyName: client.companyName,
                firstName: client.firstName,
                email: client.email,
                subscription: client.reportAccess
                    ?.map((r) => r.reportTypeId?.label)
                    .join(', '),
                license:
                    client.clientLevel === 'SINGLE'
                        ? 'SINGLE USER'
                        : client.clientLevel === 'UP_TO_3'
                            ? 'UP TO 3 USERS'
                            : 'Enterprise',
                status: client.clientStatus,
            });
        });

        return workbook;
    } catch (e) {
        throw new ApiError(e.message, 400);
    }
};

/* ================= SUB USER ================= */

const addSubUser = async (clientId, data) => {
    const client = await Client.findById(clientId);
    if (!client) throw new ApiError("Client not found", 404);
    const password = generatePassword();

    const user = await Client.create({
        ...data,
        role: "user",
        clientId,
        password: password,
    });
    await email.sendSendgridEmail(
        data.email,
        'Your Client Account',
        { email: data.email, pass: password },
        'd-38ddd55afb7e47d994f7f73ca1027050',
    );

    return user;
};

const listSubUsers = async (

    page = 1,
    limit = 10,
    clientId,
) => {
    const query = { clientId, role: "user" };



    const skip = (page - 1) * limit;

    const users = await Client.find(query)
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    const total = await Client.countDocuments(query);

    return {
        users,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
    };
};

const updateSubUser = async (userId, data) => {
    const user = await Client.findOneAndUpdate(
        { _id: userId, role: "user" },
        data,
        { new: true }
    );

    if (!user) throw new ApiError("User not found", 404);
    return user;
};

const deleteSubUser = async (userId) => {
    await Client.findOneAndDelete({
        _id: userId,
        role: "user",
    });
};

module.exports = {
    clientListFind,
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
