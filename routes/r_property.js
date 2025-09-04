const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const service = require('../services/s_property');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory:', uploadsDir);
}

// Setup storage for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueSuffix);
    }
});

const upload = multer({ storage });

// Route for listing all properties
router.get('/list', (req, res, next) => {
    service.propertyList(req, res, next);
});

// Route for adding a new property with multiple image uploads
router.post('/add', upload.array('property_images', 10), (req, res, next) => {
    service.insertProperty(req, res, next);
});

// Route for editing or deleting a property with optional image uploads
router.put('/editDelete', upload.array('property_images', 10), (req, res, next) => {
    service.updateDeleteProperty(req, res, next);
});

router.get('/available', (req, res, next) => {
    service.listAvailableProperty(req, res, next);
});



module.exports = router; 