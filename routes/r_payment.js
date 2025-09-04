const express = require('express');
const router = express.Router();
const service = require('../services/s_payment');

// Generate monthly dues for an agreement
router.post('/generate-dues', service.generateMonthlyDues);

// Get all payments for a specific agreement
router.get('/agreement/:agreement_id', service.getPaymentsByAgreement);

// Create a Razorpay order
router.post('/create-order', service.createOrder);

// Verify a payment
router.post('/verify', service.verifyPayment);

// Manually send a payment reminder for a specific due payment
router.post('/send-reminder/:payment_id', service.sendPaymentReminder);

// Get payment statistics
router.get('/stats', service.getPaymentStats);

module.exports = router; 