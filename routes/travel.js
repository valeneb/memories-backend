const express = require("express");
const router = express.Router();
const User = require("../models/users");
const Travel = require("../models/travels");

router.post("/newTravel", async (req, res) => {
  //   console.log(req.body);
  try {
    const user = await User.findOne({
      token: req.body.token,
    });
    console.log(user._id);
    if (!user) {
      res.status(401).json({
        result: false,
        error: "You have to be registered before creating a new programmation",
      });
      return;
    } else {
      // Convertir les dates du format "DD/MM/YYYY" en format JavaScript valide "YYYY-MM-DD"
      const departureDateParts = req.body.departure.split("/");
      const returnDateParts = req.body.return.split("/");
      const formattedDepartureDate = `${departureDateParts[2]}-${departureDateParts[1]}-${departureDateParts[0]}`;
      const formattedReturnDate = `${returnDateParts[2]}-${returnDateParts[1]}-${returnDateParts[0]}`;
      const latitude = parseFloat(req.body.latitude);
      const longitude = parseFloat(req.body.longitude);
      const newTrip = await new Travel({
        destination: req.body.destination,
        departure: formattedDepartureDate,
        return: formattedReturnDate,
        location: {
          type: "Point",
          coordinates: [latitude, longitude],
        },
        user: user._id.toString(),
      });
      const savedTrip = await newTrip.save();
      //   console.log(savedTrip._id.toString());
      res.status(200).json({ result: true, trip: savedTrip });
    }
  } catch (error) {
    console.error({ error: error.message });
    res.status(400).json({ result: false, error: "Wrong" });
  }
});
router.get("/", async (req, res) => {
  try {
    const user = await User.findOne({ token: req.body.token });
    if (!user) {
      res.status(401).json({
        result: false,
        error: "User not found",
      });
      return;
    }
    const travels = await Travel.find({ user: user._id }).exec();
    console.log(travels._id);
    res.status(200).json({ result: true, trips: travels });
  } catch (error) {
    console.error({ error: error.message });
    res.status(500).json({ result: false, error: "An error occured" });
  }
});

module.exports = router;
