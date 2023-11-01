const express = require("express");
const router = express.Router();
const Travel = require("../../models/travels");

function getDefault(value, defaultValue = "") {
  return value ? value : defaultValue;
}

function formatDate(date) {
  if (date) {
    console.log(date);
    const dateParts = date.split("/");
    return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
  }
  return null;
}

function formatTime(time) {
  if (time) {
    return new Date(`1970-01-01T${time}`);
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
      travel.travelPlanning = [{ flights: [] }];
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

    const flightBooking = await Travel.findByIdAndUpdate(req.query._id, {
      $push: { "travelPlanning.flights": newFlight },
    });
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
  try {
    const travelId = req.query._id;

    // Find the travel by ID
    const travel = await Travel.findById(travelId);

    if (!travel) {
      return res.status(404).json({
        result: false,
        error: "Travel not found",
      });
    }

    // Retrieve all flights from the travel's flight list
    const flights = travel.travelPlanning.flights;
    // console.log(flights);
    res.status(200).json({ result: true, flights });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ result: false, error: error.message });
  }
});

// Update an existing flight within a travel
router.put("/updateFlight", async (req, res) => {
  // console.log(req.query);
  try {
    const travelId = req.query.travelId;
    const flightId = req.query.flightId;

    // Find the travel by ID
    const travel = await Travel.findById(travelId);
    // console.log(travel);
    if (!travel) {
      return res.status(404).json({
        result: false,
        error: "Travel not found",
      });
    }

    // Find the flight within the travel's flight listconst flight =
    // const mapOfFlights = travel.travelPlanning.flights.map((flightItem) => {
    //   // console.log(flightItem._id);

    //   if (flightId.toString() === flightItem._id.toString()) {
    //     console.log("j'ai trouvé le vol ");
    const flight = travel.travelPlanning.flights.find(
      (flightItem) => flightId.toString() === flightItem._id.toString()
    );
    if (!flight) {
      return res.status(404).json({
        result: false,
        error: "Flight not found in this travel",
      });
    }
    // console.log(flight);
    if (flight) {
      // Update flight properties
      // const updatedFlight = {
      //   airline: req.body.airline || "",
      //   departureAirport: req.body.departureAirport || "",
      //   arrivalAirport: req.body.arrivalAirport || "",
      //   flightNumber: req.body.flightNumber || "",
      //   departureDate: formattedDepartureDate,
      //   returnDate: formattedReturnDate,
      //   arrivalDate: formattedArrivalDate,
      //   departureTime: departureTime ,
      //   arrivalTime: arrivalTime ,
      //   comments: req.body.comments ,
      //   price: req.body.price ,
      // };

      // ...add other properties you want to update

      if (req.body.airline) {
        flight.airline = req.body.airline;
      }
      if (req.body.departureAirport) {
        flight.departureAirport = req.body.departureAirport;
      }

      if (req.body.arrivalAirport) {
        flight.arrivalAirport = req.body.arrivalAirport;
      }
      if (req.body.flightNumber) {
        flight.flightNumber = req.body.flightNumber;
      }

      if (req.body.departureDate && formattedDepartureDate) {
        const departureDateParts = req.body.departureDate.split("/");
        const formattedDepartureDate = `${departureDateParts[2]}-${departureDateParts[1]}-${departureDateParts[0]}`;
        flight.departureDate = formattedDepartureDate;
      }
      if (req.body.returnDate) {
        const returnDateParts = req.body.returnDate.split("/");
        const formattedReturnDate = `${returnDateParts[2]}-${returnDateParts[1]}-${returnDateParts[0]}`;
        flight.returnDate = formattedReturnDate;
      }
      if (req.body.arrivalDate) {
        const arrivalDateParts = req.body.arrivalDate.split("/");

        const formattedArrivalDate = `${arrivalDateParts[2]}-${arrivalDateParts[1]}-${arrivalDateParts[0]}`;
        flight.arrivalDate = formattedArrivalDate;
      }
      const departureTime = new Date(`1970-01-01T${req.body.departureTime}`);
      if (req.body.departureTime && departureTime) {
        flight.departureTime = req.body.departureTime;
      }
      const arrivalTime = new Date(`1970-01-01T${req.body.arrivalTime}`);
      if (req.body.arrivalTime && arrivalTime) {
        flight.arrivalTime = req.body.arrivalTime;
      }
      if (req.body.comments) {
        flight.comments = req.body.comments;
      }
      if (req.body.price) {
        flight.price = req.body.price;
      }
      // const updatedFlight = await Travel.findOneAndUpdate(
      //   { flightId },
      //   { $set: flight },
      //   { new: true }
      // );
      // const victoire =
      await travel.travelPlanning.flights.id(flightId).set(flight);

      // console.log(victoire);
      const updatedTravel = await travel.save();
      res.status(200).json({ result: true, flight: updatedTravel });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ result: false, error: error.message });
  }
});
// Delete all flights or a single flight of a specific travel
router.delete("/deleteFlights", async (req, res) => {
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
      const flightTodelete = await Travel.findOneAndUpdate(
        {
          _id: travelId,
        },
        { $pull: { "travelPlanning.flights": { _id: flightId } } }
      );
      // console.log(flightTodelete);
      // console.log(travel.travelPlanning.flights);
      //  deleteOne({
      //     flightId: flightId,
      //   });
      //   if (!flight) {
      //
      //   }
      //   console.log(flightTodelete);
      //   flight.remove();

      //  else {
      //   // If flightId is not provided, delete all flights of the travel
      //   travel.travelPlanning.flights = [];
      // }

      // Save the updated travel with flights removed

      res.status(200).json({ result: true, travel: flightTodelete });
      // const updatedTravel = await travel.save();
      // console.log(updatedTravel);
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ result: false, error: error.message });
  }
});

module.exports = router;
