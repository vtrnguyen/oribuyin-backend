const express = require("express");
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.post("/", authenticate, authorize(["customer"]), reviewController.createReview);

module.exports = router;
