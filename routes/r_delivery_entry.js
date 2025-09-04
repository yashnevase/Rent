

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const service = require('../services/s_delivery_entry');

// Setup storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueSuffix);
    }
});

// File upload middleware
const upload = multer({ storage });

// Routes

// List entries
router.get('/list', (req, res, next) => {
    service.deliveryentryList(req, res, next);
});

// Add new delivery entry with receipt upload
// router.post('/add', upload.fields([
//     { name: 'upload_receipt', maxCount: 1 }
// ]), (req, res, next) => {
//     service.insertdeliveryEntry(req, res, next);
// });

router.post('/add', upload.array('upload_receipt[]', 10), (req, res, next) => {
    service.insertdeliveryEntry(req, res, next);
});


// Edit/Delete delivery entry with optional file re-upload
router.put('/editDelete', upload.fields([
    { name: 'upload_receipt', maxCount: 1 }
]), (req, res, next) => {
    service.updateDeleteDeliveryEntry(req, res, next);
});



// CUSTOM CHALLAN NO
router.get('/challanNo', (req, res, next) => {
  service.deliveryChallanNo(req, res, next);
});




module.exports = router;
