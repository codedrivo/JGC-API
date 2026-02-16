const User = require('../../models/user.model');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const ApiError = require('../../helpers/apiErrorConverter');
const email = require('../email/email.service');

const generatePassword = () => {
  return Math.random().toString(36).slice(-8) + '@1A';
};
// Create new user
const createUser = async (data) => {
  const checkEmail = await User.findOne({ email: data.email });
  if (checkEmail) {
    throw new ApiError('Email already exists', 400);
  }
  const user = await User.create(data);
  return getUserById(user._id);
};

// User login
const loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  if (!(await user.isPasswordMatch(password))) {
    throw new ApiError('Invalid email or password', 401);
  }
  user.online = true;
  await user.save();
  return getUserById(user._id);
};

// Find user by id
const findUserByEmail = async (email) => {
  return User.findOne({ email });
};

// Find user by id
const checkUserExistById = async (id) => {
  return User.findById(id);
};
// Change pasword
const changePassword = async (email, password) => {
  const pwd = await bcrypt.hash(password, 8);
  return User.findOneAndUpdate({ email }, { password: pwd });
};

// Update notification settings
const updateNotificationSetting = async (email, notification) => {
  return User.findOneAndUpdate({ email }, { notification });
};

const getUserById = async (id) => {
  return User.findById(new mongoose.Types.ObjectId(id));
};

const getUserDataById = async (id) => {
  try {
    return User.findById(new mongoose.Types.ObjectId(id));
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

// Delete user account
const deleteAccountById = async (id) => {
  return User.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
};

// Update password
const updatePassword = async (user, newpass, oldpass) => {
  const isMatch = await bcrypt.compare(oldpass, user.password);
  if (!isMatch) {
    throw new ApiError('Invalid credentials', 400);
  }
  if (oldpass.trim() === newpass.trim()) {
    throw new ApiError(
      'New password cannot be the same as the old password',
      400,
    );
  }
  return changePassword(user.email, newpass);
};
// update User
const updateUser = async (id, data) => {
  const updatedUser = await User.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true },
  );

  return updatedUser;
};

const listUser = async (currentUserId) => {
  const totalItems = await User.countDocuments({
    role: 'user',
    _id: { $ne: currentUserId },
  });
  const users = await User.find({ role: 'user', _id: { $ne: currentUserId } })
    .sort({ createdAt: -1 })
    .limit(30);

  const userList = {
    users,
    totalResults: totalItems,
  };

  return userList;
};


/* ================= GET CLIENT ================= */
const getClientById = async (id) => {
  const client = await User.findOne({
    _id: id,
    role: 'client',
  });

  if (!client) throw new ApiError('Client not found', 404);
  return client;
};

const listSubUsers = async (

  page = 1,
  limit = 10,
  clientId,
) => {
  const query = { clientId, role: "user" };



  const skip = (page - 1) * limit;

  const users = await User.find(query)
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

  return {
    users,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};

const addSubUser = async (clientId, data) => {
  const client = await User.findById(clientId);
  if (!client) throw new ApiError("Client not found", 404);

  const password = generatePassword();

  const user = await User.create({
    ...data,
    role: "user",
    clientId,
    password: password,
  });
  await email.sendSendgridEmail(
    data.email,
    'Your Client Account',
    { otp: password },
    'd-c60beffa1f45430eb5ed565009adfef6',
  );

  return user;
};

const removeSubUser = async (clientId, userId) => {
  const client = await User.findById(clientId);
  if (!client) {
    throw new ApiError("Client not found", 404);
  }

  const deletedUser = await User.findOneAndDelete({
    _id: userId,
    clientId: clientId, // 🔥 ownership check
    role: "user",
  });

  if (!deletedUser) {
    throw new ApiError("Sub user not found or not authorized", 404);
  }

  return deletedUser;
};


module.exports = {
  createUser,
  loginUser,
  findUserByEmail,
  changePassword,
  getUserById,
  deleteAccountById,
  updatePassword,
  updateNotificationSetting,
  getUserDataById,
  checkUserExistById,
  updateUser,
  listUser,
  getClientById,
  listSubUsers,
  addSubUser,
  removeSubUser
};
