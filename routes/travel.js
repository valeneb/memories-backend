const express = require("express");
const router = express.Router();
const User = require("../models/users");
const Travel = require("../models/travels");
// TODO CREATE NEWTRAVEL POST
router.post("/newTravel", async (req, res) => {
  // console.log(req.body);
  try {
    const user = await User.findOne({
      token: req.body.token,
    });
    // console.log(user._id);
    if (!user) {
      res.status(401).json({
        result: false,
        error: "You have to be registered before creating a new programmation",
      });
      return;
    }
    if (user._id) {
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
      // console.log(user.id);
      const savedTrip = await newTrip.save();
      user.travels.push(savedTrip._id);
      await user.save();
      // console.log(savedTrip._id.toString());
      res.status(200).json({ result: true, trip: savedTrip });
    }
  } catch (error) {
    console.error({ error: error.message });
    res.status(400).json({ result: false, error: "Wrong" });
  }
});

// TODO GET TO GET ALL TRAVELS
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
// TODO UPDATE DATE DESTINATION DATE=>BOTH
router.put("/update", async (req, res) => {
  // console.log(req.body);
  try {
    // Vérifiez si l'ID de l'objet à mettre à jour est fourni dans le corps de la requête.
    if (!req.body._id) {
      return res.status(400).json({
        result: false,
        error: "You must provide the _id of the travel to update.",
      });
    }
    // console.log(req.body._id);

    //? à voir si il faut formater la date par la suite mais tout fonctionne
    //!voir pour la gestion géospatiale si géré en front sinon peut avec mongoDB pour mpodifier une ville qui correspond à ses coordonnées géomètriquesmais complexe

    //Créez un objet contenant les champs à mettre à jour.const updateFields = {};
    if (req.body.destination) {
      updateFields.destination = req.body.destination;
    }
    if (req.body.departure) {
      updateFields.departure = req.body.departure;
    }
    if (req.body.return) {
      updateFields.return = req.body.return;
    }
    if (req.body.latitude) {
      updateFields.latitude = req.body.latitude;
    }
    if (req.body.longitude) {
      updateFields.longitude = req.body.longitude;
    }

    // Effectuez la mise à jour en utilisant findOneAndUpdate.
    const updatedTravel = await Travel.findOneAndUpdate(
      { _id: req.body._id },
      { $set: updateFields },
      { new: true } // Pour obtenir le document mis à jour
    );

    if (!updatedTravel) {
      return res.status(404).json({
        result: false,
        error: "Travel not found",
      });
    }
    // console.log(res.result.nModified + " document(s) updated");
    res.status(200).json({ result: true, trip: updatedTravel });
  } catch (error) {
    console.error({ error: error.message });
    res.status(500).json({ result: false, error: "An error occurred" });
  }
});

// TODO DELETE
router.delete("/deleteTrip", async (req, res) => {
  // console.log(req.body);
  try {
    if (!req.body._id) {
      return res.status(400).json({
        result: false,
        error: "You must provide the _id of the travel to delete.",
      });
    }
    const deletedDestination = await Travel.deleteOne({
      _id: req.body._id,
    });
    if (deletedDestination.deletedCount > 0) {
      // console.log(deletedDestination);
      res.status(204).json({ result: true, travel: deletedDestination });
    } else {
      res.status(402).json({ result: false, message: "place not found" });
    }
  } catch (error) {
    console.error({ error: error.message });
    res.status(500).json({ result: false, error: "An error occurred" });
  }
});
module.exports = router;
