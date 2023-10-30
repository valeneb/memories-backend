const express = require("express");
const router = express.Router();
const Travel = require("../../models/travels");

router.post("/newFlight", async (req, res) => {
  try {
    const travel = await Travel.findById(req.query._id);
    // console.log(travel);
    if (!travel) {
      res.status(401).json({
        result: false,
        error:
          "i don't find a travel create one and come back to prove your experience",
      });
    }
    // Assurez-vous que req.body est un tableau
    // if (!Array.isArray(req.body)) {
    //   return res.status(400).json({
    //     result: false,
    //     error: "Les données de vol doivent être un tableau.",
    //   });
    // }

    if (travel._id) {
      const {
        airline,
        departureAirport,
        arrivalAirport,
        flightNumber,
        comments,
        price,
      } = req.body;
      const departureDateParts = req.body.departureDate.split("/");
      const returnDateParts = req.body.returnDate.split("/");
      const arrivalDateParts = req.body.arrivalDate.split("/");
      const formattedDepartureDate = `${departureDateParts[2]}-${departureDateParts[1]}-${departureDateParts[0]}`;
      const formattedArrivalDate = `${arrivalDateParts[2]}-${arrivalDateParts[1]}-${arrivalDateParts[0]}`;
      const formattedReturnDate = `${returnDateParts[2]}-${returnDateParts[1]}-${returnDateParts[0]}`;
      const departureTime = new Date(`1970-01-01T${req.body.departureTime}`);
      const arrivalTime = new Date(`1970-01-01T${req.body.arrivalTime}`);

      const newFlight = {
        airline,
        departureAirport,
        arrivalAirport,
        flightNumber,
        formattedDepartureDate,
        formattedReturnDate,
        formattedArrivalDate,
        departureTime,
        arrivalTime,
        comments,
        price,
      };

      console.log(newFlight);
      console.log(travel.travelPlanning[0]);
      travel.travelPlanning[0].flights.push(newFlight);

      // console.log(travel);

      const savedFlightInTravel = await travel.save(newFlight);
      res.status(200).json({ result: true, travel: savedFlightInTravel });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ result: false, error: error.message });
  }
});

module.exports = router;
