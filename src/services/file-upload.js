const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');

aws.config.update({
  secretAccessKey: process.env.AWS_S3,
  accessKeyId: process.env.AWS_S3,
  region: 'eu-west-2',
});

const s3 = new aws.S3();

const upload = multer({
  storage: multerS3({
    s3,
    bucket: 'modelify-images',
    acl: 'public-read',
    metadata(req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key(req, file, cb) {
      cb(null, Date.now().toString());
    },
  }),
});

module.exports = upload;