const { format } = require("date-fns");
const express = require("express");
const router = express.Router();
const User = require("../models/users");
const Travel = require("../models/travels");

router.post("/newTrip", async (req, res) => {
  try {
    const user = User.findOne({
      token: req.body.token,
    });

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

      const newTrip = await new Travel({
        destination: req.body.destination,
        departue: formattedDepartureDate,
        return: formattedReturnDate,
        // location: {
        //   type: "Point",
        //   coordinates: [req.body.longitude, req.body.latitude],
        // },
      });
      await newTrip.save();
      res.status(200).json({ result: true, trip: newTrip });
    }
  } catch (error) {
    console.error({ error: error.message });
    res.status(400).json({ result: false, error: "Invalid Date Format" });
  }
});

module.exports = router;
