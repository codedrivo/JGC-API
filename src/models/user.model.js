const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');
const bcrypt = require('bcrypt');
const ApiError = require('../helpers/apiErrorConverter');
const ReportType = require('./reportType.model');

const assignedReportSchema = new mongoose.Schema(
  {
    reportTypeId: {
      type: mongoose.Types.ObjectId,
      ref: ReportType,
      required: true,
    },

    startDate: {
      type: Date,
    },

    viewDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    /* ============== CLIENT FIELDS (role: client) ============== */
    companyName: {
      type: String,
      trim: true,
    },

    customerID: {
      type: String,
      trim: true,
    },

    clientLevel: {
      type: String,
      enum: ["SINGLE", "UP_TO_3", "ENTERPRISE"],
      trim: true,
    },

    clientStatus: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      trim: true,
    },

    /* ============== COMMON PERSON FIELDS ============== */
    firstName: {
      type: String,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new ApiError("Invalid email", 400);
        }
      },
    },

    password: {
      type: String,
      minlength: 8,
      private: true,
      // ❌ trim should NOT be used for passwords
    },

    role: {
      type: String,
      enum: ["client", "admin", "user"],
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      trim: true,
    },

    /* ============== USER FIELDS (admin / user) ============== */
    positionTitle: {
      type: String,
      trim: true,
    },

    clientId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },

    reportAccess: {
      type: [assignedReportSchema],
      default: [],
    },
  },
  { timestamps: true }
);


/* ================= INDEX ================= */
userSchema.index({ email: 1 });
userSchema.index({ clientId: 1, role: 1 });

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);

// add apgination plugin
userSchema.plugin(paginate);

// check is user password is matching
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  console.log(await bcrypt.compare(password, user.password));
  return bcrypt.compare(password, user.password);
};

// hash the user password before saving data to db
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

// login user
userSchema.statics.loginUser = async function (email, password) {
  const user = await this.findOne({ email });

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  if (!(await user.isPasswordMatch(password))) {
    throw new ApiError('Invalid email or password', 400);
  }

  if (user.block) {
    throw new ApiError('You are blocked by admin', 400);
  }

  return user;
};

userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
