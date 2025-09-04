const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const service = require('../services/s_tenant');

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

// Route for listing all tenants
router.get('/list', (req, res, next) => {
    service.tenantList(req, res, next);
});

// Route for adding a new tenant with image upload
router.post('/add', upload.fields([
    { name: 'tenent_image', maxCount: 1 }
]), (req, res, next) => {
    service.insertTenant(req, res, next);
});

// Route for editing or deleting a tenant with optional image upload
router.put('/editDelete', upload.fields([
    { name: 'tenent_image', maxCount: 1 }
]), (req, res, next) => {
    service.updateDeleteTenant(req, res, next);
});

// Route for listing available tenants
router.get('/available', (req, res, next) => {
    service.listAvailableTenants(req, res, next);
});



module.exports = router; 