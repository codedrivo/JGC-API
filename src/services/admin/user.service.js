const User = require('../../models/user.model');
const ApiError = require('../../helpers/apiErrorConverter');
const mongoose = require('mongoose');
const { http } = require('winston');
const ExcelJS = require("exceljs");
const email = require('../email/email.service');

/* ================= LIST USERS ================= */
const userListFind = async (
  limit = 10,
  page = 1,
  search = '',
  status = '',
  subscriptions = []
) => {
  try {
    const query = { role: 'user' };
    /* SEARCH */
    if (search) {
      const sanitized = search.replace(/"/g, '');
      query.$or = [
        { firstName: { $regex: sanitized, $options: 'i' } },
        { lastName: { $regex: sanitized, $options: 'i' } },
        { email: { $regex: sanitized, $options: 'i' } },
        { positionTitle: { $regex: sanitized, $options: 'i' } },
      ];
    }

    /* STATUS FILTER */
    if (status && status !== 'All') {
      query.status = status;
    }

    /* SUBSCRIPTION FILTER (reportTypeId) */
    if (subscriptions.length) {
      query['reportAccess.reportTypeId'] = {
        $in: subscriptions.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    const skip = (page - 1) * limit;
    const totalItems = await User.countDocuments(query);

    const users = await User.find(query)
      .populate('reportAccess.reportTypeId')
      .populate({
        path: "clientId",
        select: "firstName lastName companyName email status"
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      users,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
      totalResults: totalItems,
    };
  } catch (e) {
    throw new ApiError(e.message, 400);
  }
};

/* ================= EXPORT CLIENTS ================= */
const exportUsers = async (
  search = '',
  status = '',
  subscriptions = []
) => {
  try {
    const query = { role: 'user' };

    /* SEARCH */
    if (search) {
      const sanitized = search.replace(/"/g, '');
      query.$or = [
        { firstName: { $regex: sanitized, $options: 'i' } },
        { lastName: { $regex: sanitized, $options: 'i' } },
        { email: { $regex: sanitized, $options: 'i' } },
        { positionTitle: { $regex: sanitized, $options: 'i' } },
      ];
    }

    /* STATUS */
    if (status && status !== 'All') {
      query.status = status;
    }

    /* SUBSCRIPTIONS */
    if (subscriptions.length) {
      query['reportAccess.reportTypeId'] = {
        $in: subscriptions.map(
          (id) => new mongoose.Types.ObjectId(id)
        ),
      };
    }

    const users = await User.find(query)
      .populate('reportAccess.reportTypeId')
      .populate('clientId')
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
      { header: 'First Name', key: 'status', width: 15 },
      { header: 'Last Name', key: 'status', width: 15 },
      { header: 'Position', key: 'status', width: 15 },
      { header: 'User Email', key: 'status', width: 15 },
    ];

    users.forEach((usr) => {
      worksheet.addRow({
        companyName: usr.clientId.companyName,
        firstName: usr.clientId.firstName,
        email: usr.clientId.email,
        subscription: usr.clientId.reportAccess
          ?.map((r) => r.reportTypeId?.label)
          .join(', '),
        license:
          usr.clientId.clientLevel === 'SINGLE'
            ? 'SINGLE USER'
            : usr.clientId.clientLevel === 'UP_TO_3'
              ? 'UP TO 3 USERS'
              : 'Enterprise',
        status: usr.clientId.clientStatus,

        firstName: usr.firstName,
        lastName: usr.lastName,
        email: usr.email,
        position: usr.positionTitle,
      });
    });

    return workbook;
  } catch (e) {
    throw new ApiError(e.message, 400);
  }
};

module.exports = {
  userListFind,
  exportUsers
};
