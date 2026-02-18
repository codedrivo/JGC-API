const router = require('express').Router();

const authRouter = require('./auth/auth.route');
const adminAuth = require('./admin/auth/auth.route');
const Profile = require('./profile/profile.route');
const settings = require('./site-settings/sitesettings.route');
const pages = require('../routes/page.route');

const reportType = require('../routes/reportType.route');

//admin profile
const adminProfile = require('./admin/profile.route');
const userManagement = require('./admin/user.route');
const clientManagement = require('./admin/client.route');
const adminSetting = require('./admin/setting.route');
const adminDashboard = require('./admin/dashboard.route');

// all routes
router.use('/auth', authRouter);
router.use('/profile', Profile);
router.use('/settings', settings);
router.use('/pages', pages);
router.use('/reportType', reportType)

// all admin route
router.use('/admin', adminAuth);
router.use('/admin/dashboard', adminDashboard);
router.use('/admin/profile', adminProfile);
router.use('/admin/user', userManagement);
router.use('/admin/client', clientManagement);
router.use('/admin/setting', adminSetting);

module.exports = router;
