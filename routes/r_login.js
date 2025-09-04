const express = require('express')
const router = express.Router()
const service = require('../services/s_login')
const lib = require('../libs/index')



router.post('/loginOwner', (req, res, next) => {
    service.loginowner(req, res, next)
})

router.post('/loginTenent', (req, res, next) => {
    service.logintenant(req, res, next)
})

router.post('/signupOwner', (req, res, next) => {
    service.signupowner(req, res, next)
})

router.post('/signupTenent', (req, res, next) => {
    service.signuptenant(req, res, next)
})

router.post('/logout', (req, res, next) => {
    service.logout(req, res, next)
})


module.exports = router