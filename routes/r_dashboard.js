const express = require('express');
const router = express.Router();
const service = require('../services/s_dashboard');

router.get('/stats', (req, res, next) => {
    service.getStats(req, res, next);
});

module.exports = router;
