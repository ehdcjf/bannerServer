const router = require('express').Router();
const mainController = require('./main.controller');

router.get('/show', mainController.updateHit);
router.get('/down', mainController.updateDown);



module.exports = router;