const catchAsync = require('../../helpers/asyncErrorHandler');
const service = require('../../services/auth/auth.service');
const ApiError = require('../../helpers/apiErrorConverter');

// Delete account
const deleteAccount = catchAsync(async (req, res, next) => {
  await service.deleteAccountById(req.user._id);
  res.status(200).send({ message: 'Account Deleted Successfully' });
});

const edituser = catchAsync(async (req, res) => {
  const userData = await service.getUserByIdWithGroup(req.params.id);
  const teamData = await service.getTeamByUserId(req.params.id);
  const matchData = await service.getMatchByUserId(req.params.id, teamData);
  res.status(200).send({ status: 200, userData: userData, team: teamData, matchData: matchData });
});

// Password change
const passwordChange = catchAsync(async (req, res, next) => {
  await service.updatePassword(
    req.user,
    req.body.password_new,
    req.body.password_old,
  );
  res
    .status(200)
    .send({ status: 200, message: 'Password Updated Successfully' });
});

// Notification settings
const notificationToggle = catchAsync(async (req, res, next) => {
  await service.updateNotificationSetting(
    req.user.email,
    req.body.notification,
  );
  res
    .status(200)
    .send({ message: 'Notification Settings Updated Successfully' });
});

// Get profile
const getProfile = catchAsync(async (req, res, next) => {
  res.status(200).send({ message: 'Profile Data', user: req.user });
});

// Update profile with image
const updateProfile = catchAsync(async (req, res, next) => {
  /*if (req.file) {
    req.body.profileimageurl = req.file.location;
  }*/
  const user = await service.updateUser(req.user._id, req.body);
  let message = "Profile updated successfully";

  console.log(req.body);

  // Notification settings
  const isNotificationUpdate =
    "emailNotification" in req.body ||
    "textNotification" in req.body ||
    "pushNotification" in req.body;

  // Communication preference
  const isCommPrefUpdate = "communicationPref" in req.body;

  if (isNotificationUpdate) {
    message = "Notification settings updated successfully";
  } else if (isCommPrefUpdate) {
    message = "Communication preferences updated successfully";
  }

  res.status(200).send({
    message,
    data: { user },
  });
});

const listusers = catchAsync(async (req, res, next) => {
  const id = req.user._id;
  const users = await service.listUser(id);
  res.status(200).send({ users });
});

const addSupport = catchAsync(async (req, res) => {
  userId = req.user._id;
  const data = {
    userId,
    ...req.body,
  };
  const supportData = await service.addSupport(data);
  res.status(200).json({
    message: 'Data added successfully',
    data: supportData,
  });
});

const myAccount = catchAsync(async (req, res) => {
  const { _id, role, clientId } = req.user;

  let client_id;

  // ================= ROLE BASED CLIENT ID =================
  if (role === 'client') {
    client_id = _id; // main client
  } else if (role === 'user') {
    client_id = clientId; // sub user -> parent client
  }

  // ================= FETCH USERS =================
  const client = await service.getClientById(client_id);
  const user = await service.listSubUsers(1, 20, client_id);
  res.status(200).json({
    status: 200,
    client,
    user
  });
});

const addSubUser = catchAsync(async (req, res) => {
  const data = await service.addSubUser(
    req.user._id,
    req.body
  );
  res.status(200).json({ status: 200, data });
});

const removeSubUser = catchAsync(async (req, res) => {
  const data = await service.removeSubUser(
    req.user._id,
    req.params.userId
  );
  res.status(200).json({ status: 200, data });
});
module.exports = {
  deleteAccount,
  passwordChange,
  getProfile,
  updateProfile,
  notificationToggle,
  addSupport,
  listusers,
  edituser,
  myAccount,
  addSubUser,
  removeSubUser
};
