const express = require('express');
const multer = require('multer');
const path = require('path');

const scanController = require('../controllers/scanController');

const router = express.Router();

const upload = multer({
    dest: path.join(__dirname, '../../uploads')
});

router.post(
    '/scan',
    upload.single('image'),
    scanController.scan
);

router.post(
    '/scan-alter',
    upload.single('image'),
    scanController.scanAlter
);

module.exports = router;