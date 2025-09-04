const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const service = require('../services/s_user_master');
const lib = require('../libs/index');

// Setup storage for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueSuffix);
    }
});

const upload = multer({ storage });

// Route for listing all users
router.get('/list', (req, res, next) => {
    service.UserMasterList(req, res, next);
});

// Route for adding a new user with profile image upload
router.post('/add', upload.fields([
    { name: 'profile_image', maxCount: 1 }
]), (req, res, next) => {
    service.insertUserMaster(req, res, next);
});

// Route for editing or deleting a user with optional profile image upload
router.put('/editDelete', upload.fields([
    { name: 'profile_image', maxCount: 1 }
]), (req, res, next) => {
    service.updateDeleteUserMaster(req, res, next);
});

module.exports = router;

