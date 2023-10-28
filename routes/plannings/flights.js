const express = require("express");
const router = express.Router();
const Travel = require("../../models/travels");

router.post("/newFlight", async (req, res) => {
  try {
    const travel = await Travel.findById(req.query._id);
    console.log(travel);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ result: false, error: error.message });
  }
});

module.exports = router;
