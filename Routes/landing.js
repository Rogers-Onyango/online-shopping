const express = require('express')
const router = express.Router();
const {getHomePageView,getProductImage} = require('../controllers/landing')


//landing page
router.get('/',getHomePageView)
router.get('/image/:filename',getProductImage)

module.exports = router