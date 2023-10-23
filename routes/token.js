const express = require("express");
const router = express.Router();
const tokenController = require("../controllers/tokenController");

// Generate token route
router.post("/token-exchange", tokenController.generateToken);

// Retrieve insights route
router.get("/retrieve-insights", tokenController.retrieveInsights);

module.exports = router;
// EAAEf8IabEEABOy6abRMuNGldfFa6RwNNQkfdZB9AbGp6s6MWb4Qu6xO80amaXDalVBQ9bPeUfTEpaDwJ3H0hOp9JdrjFo36ElRCU4L4X9bZA4fxSpJkxG01xjP9JqBVky4iAnTQsErzKDPIHiKE8x3jNLrOJvdl47ZA4Ji3e7SnEliNkX1w9Jw8V8p2SRVCUoR75q4xoGgaq3P1fNa0O1jllWd0kkTaSucTwCthxfZB7XpmmfZAfMYSrWcKA3vLsZD
