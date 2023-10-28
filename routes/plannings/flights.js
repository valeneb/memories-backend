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

    if (travel._id) {
      const {
        airline,
        flightNumber,
        departureAirport,
        arrivalAirport,

        comments,
        price,
      } = req.body;
      const departureDateParts = req.body.departureAirport.split("/");
      const returnDateParts = req.body.returnDate.split("/");
      const arrivalDateParts = req.body.arrivalDate.split("/");
      const formattedDepartureDate = `${departureDateParts[2]}-${departureDateParts[1]}-${departureDateParts[0]}`;
      const formattedArrivalDate = `${arrivalDateParts[2]}-${arrivalDateParts[1]}-${arrivalDateParts[0]}`;
      const formattedReturnDate = `${returnDateParts[2]}-${returnDateParts[1]}-${returnDateParts[0]}`;
      const departureTime = new Date(`1970-01-01T${req.body.departureTime}`);
      const arrivalTime = new Date(`1970-01-01T${req.body.arrivalTime}`);
      const newFlight = new Flight({
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
      });
      const savedFlight = await newFlight.save();
      travel.travelPlanning[0].flights.push(savedFlight);
      res.status(200).json({ result: true, flight: savedFlight });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ result: false, error: error.message });
  }
});

module.exports = router;
