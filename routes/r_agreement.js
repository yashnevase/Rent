const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const service = require('../services/s_agreement');

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

// Route for listing all agreements
router.get('/list', (req, res, next) => {
    service.agreementList(req, res, next);
});

// Route for adding a new agreement with image upload
router.post('/add', upload.fields([
    { name: 'agreement_image', maxCount: 1 }
]), (req, res, next) => {
    service.insertAgreement(req, res, next);
});

// Route for editing or deleting an agreement with optional image upload
router.put('/editDelete', upload.fields([
    { name: 'agreement_image', maxCount: 1 }
]), (req, res, next) => {
    service.updateDeleteAgreement(req, res, next);
});

// Route for listing agreements by property ID
router.get('/property/:property_id', (req, res, next) => {
    service.listAgreementsByProperty(req, res, next);
});

 module.exports = router;