const catchAsync = require('../../helpers/asyncErrorHandler');
const service = require('../../services/admin/user.service');

const listUser = catchAsync(async (req, res) => {
  const limit = req.params.limit ? Number(req.params.limit) : 10;
  const page = req.params.page ? Number(req.params.page) : 1;
  const status = req.body.status || '';
  const subscriptions = req.body.subscriptions || [];
  const search = req.body.search || '';

  const users = await service.userListFind(
    limit,
    page,
    search,
    status,
    subscriptions
  );
  res.status(200).json({ status: 200, users });
});

/* ================= EXPORT CLIENTS ================= */
const exportUsers = catchAsync(async (req, res) => {
  const status = req.body.status || '';
  const subscriptions = req.body.subscriptions || [];
  const search = req.body.search || '';
  const workbook = await service.exportUsers(
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
    'attachment; filename=users.xlsx'
  );
  await workbook.xlsx.write(res);
  res.end();
});

module.exports = {
  listUser,
  exportUsers
};
