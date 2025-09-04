const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const service = require('../services/s_owner');

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

// Route for listing all owners
router.get('/list', (req, res, next) => {
    service.ownerList(req, res, next);
});

// Route for adding a new owner with image upload
router.post('/add', upload.fields([
    { name: 'owner_image', maxCount: 1 }
]), (req, res, next) => {
    service.insertOwner(req, res, next);
});

// Route for editing or deleting an owner with optional image upload
router.put('/editDelete', upload.fields([
    { name: 'owner_image', maxCount: 1 }
]), (req, res, next) => {
    service.updateDeleteOwner(req, res, next);
});

module.exports = router; 