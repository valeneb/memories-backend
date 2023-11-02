const express = require("express");
const router = express.Router();
const Travel = require("../../models/travels");

function getDefault(value, defaultValue = "") {
  return value ? value : defaultValue;
}

function formatDate(date) {
  if (date) {
    const dateParts = date.split("/");
    return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
  }
  return null;
}

function formatTime(time) {
  if (time) {
    return `${time}`;
  }
  return null;
}
// TODO
router.post("/newFlight", async (req, res) => {
  try {
    const travel = await Travel.findById(req.query._id);
    if (!travel) {
      return res.status(401).json({
        result: false,
        error:
          "I couldn't find a travel. Create one and come back to prove your experience.",
      });
    }

    if (
      !travel.travelPlanning ||
      !Array.isArray(travel.travelPlanning) ||
      travel.travelPlanning.length === 0
    ) {
      travel.travelPlanning = { flights: [] };
    }

    const {
      airline,
      departureAirport,
      arrivalAirport,
      flightNumber,
      comments,
      price,
    } = req.body;

    const formattedDepartureDate = formatDate(req.body.departureDate);
    const formattedArrivalDate = formatDate(req.body.arrivalDate);
    const formattedReturnDate = formatDate(req.body.returnDate);
    const departureTime = formatTime(req.body.departureTime);
    const arrivalTime = formatTime(req.body.arrivalTime);

    const newFlight = {
      airline: getDefault(airline),
      departureAirport: getDefault(departureAirport),
      arrivalAirport: getDefault(arrivalAirport),
      flightNumber: getDefault(flightNumber, 0),
      departureDate: formattedDepartureDate,
      returnDate: formattedReturnDate,
      arrivalDate: formattedArrivalDate,
      arrivalTime,
      departureTime,
      comments: getDefault(comments),
      price: getDefault(price, 0),
    };

    const flightBooking = await Travel.findByIdAndUpdate(
      req.query._id,
      {
        $push: { "travelPlanning.flights": newFlight },
      },
      { new: true }
    );
    // console.log(flightBooking);
    const newFlightWithId =
      flightBooking.travelPlanning.flights[
        flightBooking.travelPlanning.flights.length - 1
      ];
    res.status(200).json({ result: true, travel: newFlightWithId });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ result: false, error: error.message });
  }
});

// Get all flights of a specific travel
router.get("/getFlights", async (req, res) => {
  console.log(req.query);
  const travelId = req.query._id;

  // Find the travel by ID
  const travel = await Travel.findById(travelId);

  if (!travel) {
    return res.status(404).json({
      result: false,
      error: "Travel not found",
    });
  }
  try {
    // Retrieve all flights from the travel's flight list
    const flights = travel.travelPlanning.flights;

    res.status(200).json({ result: true, flights });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ result: false, error: error.message });
  }
});

router.put("/updateFlight", async (req, res) => {
  try {
    const travelId = req.query.travelId;
    const flightId = req.query.flightId;

    const travel = await Travel.findById(travelId);
    if (!travel) {
      return res.status(404).json({
        result: false,
        error: "Travel not found",
      });
    }

    const flight = travel.travelPlanning.flights.find(
      (flightItem) => flightId.toString() === flightItem._id.toString()
    );
    if (!flight) {
      return res.status(404).json({
        result: false,
        error: "Flight not found in this travel",
      });
    }

    // Utilisez les fonctions pour formater les données de vol
    flight.airline = getDefault(req.body.airline, flight.airline);
    flight.departureAirport = getDefault(
      req.body.departureAirport,
      flight.departureAirport
    );
    flight.arrivalAirport = getDefault(
      req.body.arrivalAirport,
      flight.arrivalAirport
    );
    flight.flightNumber = getDefault(
      req.body.flightNumber,
      flight.flightNumber
    );
    flight.comments = getDefault(req.body.comments, flight.comments);
    flight.price = getDefault(req.body.price, flight.price);

    const formattedDepartureDate = formatDate(req.body.departureDate);
    if (formattedDepartureDate) {
      flight.departureDate = formattedDepartureDate;
    }

    const formattedReturnDate = formatDate(req.body.returnDate);
    if (formattedReturnDate) {
      flight.returnDate = formattedReturnDate;
    }

    const formattedArrivalDate = formatDate(req.body.arrivalDate);
    if (formattedArrivalDate) {
      flight.arrivalDate = formattedArrivalDate;
    }

    const formattedDepartureTime = formatTime(req.body.departureTime);
    if (formattedDepartureTime) {
      flight.departureTime = formattedDepartureTime;
    }

    const formattedArrivalTime = formatTime(req.body.arrivalTime);
    if (formattedArrivalTime) {
      flight.arrivalTime = formattedArrivalTime;
    }

    await travel.save();

    res.status(200).json({ result: true, flight: flight });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ result: false, error: error.message });
  }
});

// Delete all flights or a single flight of a specific travel
router.delete("/deleteFlight", async (req, res) => {
  try {
    const travelId = req.query.travelId;
    const flightId = req.query.flightId;

    // Find the travel by ID
    const travel = await Travel.findById(travelId);

    if (!travel) {
      return res.status(404).json({
        result: false,
        error: "Travel not found",
      });
    }
    if (!flightId) {
      return res.status(404).json({
        result: false,
        error: "Flight not found in this travel",
      });
    }

    // If flightId is provided, delete only that specific flight
    if (flightId) {
      console.log(flightId);
      const flightToDelete = await Travel.findOneAndUpdate(
        { _id: travelId },
        { $pull: { "travelPlanning.flights": { _id: flightId } } },
        { new: true }
      ).select("travelPlanning.flights");
      console.log(flightToDelete);
      if (
        !flightToDelete ||
        flightToDelete.travelPlanning.flights.length === 0
      ) {
        return res.status(404).json({
          result: false,
          error: "Hébergement introuvable dans ce voyage",
        });
      }
      // Save the updated travel with flights removed
      const deletedFlight = flightToDelete.travelPlanning.flights;
      res.status(200).json({ result: true, flight: deletedFlight });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ result: false, error: error.message });
  }
});

module.exports = router;
