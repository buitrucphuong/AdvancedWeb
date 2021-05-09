
const express = require('express');
const router = express.Router();

router.use('/', require('./addnotice'))
router.use('/', require('./adduser'))
router.use('/', require('./changepass'))
router.use('/', require('./comments'))
router.use('/', require('./home'))
router.use('/', require('./personal'))
router.use('/', require('./posts'))
router.use('/', require('./notifications'))
router.use('/', require('./autocomplete'))

module.exports = router;
