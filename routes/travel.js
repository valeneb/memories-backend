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
        user: user._id,
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
router.put("/:travelId", async (req, res) => {
  try {
    const travelId = req.params.travelId;

    const updateFields = {};

    if (req.body.destination) {
      updateFields.destination = req.body.destination;
    }
    if (req.body.departure) {
      const departureDateParts = req.body.departure.split("/");
      const formattedDepartureDate = `${departureDateParts[2]}-${departureDateParts[1]}-${departureDateParts[0]}`;
      // Convert date format if needed
      // Example: "DD/MM/YYYY" to "YYYY-MM-DD"
      updateFields.departure = formattedDepartureDate;
    }
    if (req.body.return) {
      const returnDateParts = req.body.return.split("/");

      const formattedReturnDate = `${returnDateParts[2]}-${returnDateParts[1]}-${returnDateParts[0]}`;

      // Convert date format if needed
      // Example: "DD/MM/YYYY" to "YYYY-MM-DD"
      updateFields.return = formattedReturnDate;
    }

    // Use updateOne to update the travel item
    const result = await Travel.updateOne(
      { _id: travelId },
      { $set: updateFields }
    );

    // Check if the travel item was found and updated
    if (result.nModified === 0) {
      return res.status(404).json({ result: false, error: "Travel not found" });
    }

    // Send a response indicating success
    res
      .status(200)
      .json({ result: true, message: "Travel updated successfully" });
  } catch (error) {
    console.error({ error: error.message });
    res.status(500).json({ result: false, error: "An error occurred" });
  }
});

module.exports = router;
