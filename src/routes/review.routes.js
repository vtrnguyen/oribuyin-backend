const express = require("express");
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.get('/by-average-rating', authenticate, authorize(['admin', 'staff']), reviewController.getReviewsByAvgRating);
router.post("/", authenticate, authorize(["customer"]), reviewController.createReview);

module.exports = router;
