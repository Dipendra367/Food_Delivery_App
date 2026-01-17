const express = require('express');
const router = express.Router();
const geocodingController = require('../controllers/geocodingController');

// GET /api/geocoding/forward?street=...&area=...&city=...
router.get('/forward', geocodingController.forwardGeocode);

// GET /api/geocoding/reverse?lat=...&lng=...
router.get('/reverse', geocodingController.reverseGeocode);

// GET /api/geocoding/city/:city
router.get('/city/:city', geocodingController.getDefaultCityCoordinates);

module.exports = router;
