const express = require('express');

const takoController =
    require('../controllers/takoController');

const youtubeController =
    require('../controllers/youtubeController');

const router = express.Router();


// Tako Donation
router.post(
    '/tako',
    takoController.handleTako
);


// YouTube WebSub Verification
router.get(
    '/youtube',
    youtubeController.verifyYoutube
);


// YouTube WebSub Notification
router.post(
    '/youtube',
    express.raw({
        type: 'application/atom+xml'
    }),
    youtubeController.handleYoutube
);

module.exports = router;