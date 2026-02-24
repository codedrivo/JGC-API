const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const config = require('../config/config');

const s3 = new S3Client({
  region: config.s3.AWS_REGION,
  credentials: {
    accessKeyId: config.s3.AWS_ACCESS_KEY,
    secretAccessKey: config.s3.AWS_SECRET_KEY,
  },
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: config.s3.S3_BUCKET_PATH,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, {
        originalName: file.originalname,
      });
    },
    key: function (req, file, cb) {
      const extension = path.extname(file.originalname);
      const uniqueKey = `reports/${Date.now()}${extension}`;
      cb(null, uniqueKey);
    },
  }),

  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },

  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files allowed'), false);
    }
    cb(null, true);
  },
});

module.exports = upload;