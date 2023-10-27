const express = require("express");
const router = express.Router();
const User = require("../models/users");
const Travel = require("../models/travels");
const cloudinary = require("cloudinary").v2;
// cloudinary.config({
//   cloud_name: "dbmg2zl7x",
//   api_key: "237518157193281",
//   api_secret: "ucWJnMRH_GBvQcP6RQDgUsAnDJ4",
// });
const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};
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
      // coverImage
      // console.log(req.files);
      if (!req.files || !req.files.image) {
        return res
          .status(400)
          .json({ result: false, message: "No file uploaded" });
      }
      if (req.files || res.files?.image) {
        const resultToUpload = await cloudinary.uploader.upload(
          convertToBase64(req.files.image),
          {
            folder: `memories/travelsCover/${newTrip._id}`,
            public_id: "coverImage",
          }
        );
        // console.log(resultToUpload);
        // console.log((newTrip.coverImage = resultToUpload));
        newTrip.coverImage = resultToUpload;
      }
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

// TODO GET but POST because the front doesn't want to accept to GET method by req.body TO GET ALL TRAVELS
router.get("/", async (req, res) => {
  console.log(req.query);
  try {
    const user = await User.findOne({ token: req.query.token });
    // console.log(user);
    if (!user) {
      res.status(401).json({
        result: false,
        error: "User not found",
      });
      return;
    }
    const travels = await Travel.find({ user: user._id }).exec();
    // console.log(travels);
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

    //Créez un objet contenant les champs à mettre à jour.
    const updateFields = {};
    // console.log(req.body.destination);
    if (req.body.destination) {
      updateFields.destination = req.body.destination;
      // console.log(updateFields.destination);
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
    if (req.files?.image) {
      if (!updateFields.coverImage) {
        updateFields.coverImage = {};
      }
      // console.log(req.files);

      if (updateFields.coverImage.public_id) {
        console.log(updateFields.coverImage.public_id);
        await cloudinary.uploader.destroy(updateFields.coverImage.public_id);
      }

      const uploadedCoverImage = await cloudinary.uploader.upload(
        convertToBase64(req.files.image),
        {
          folder: `memories/travelsCover/${updateFields._id}`,
          public_id: "coverImage",
        }
      );
      console.log(uploadedCoverImage.public_id);
      updateFields.coverImage = uploadedCoverImage;
    }
    console.log(updateFields);
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
  const travelId = req.query._id;
  // console.log(req.body);
  try {
    if (!travelId) {
      return res.status(400).json({
        result: false,
        error: "You must provide the _id of the travel to delete.",
      });
    }
    const deletedDestination = await Travel.findByIdAndDelete(travelId);
    console.log(deletedDestination);
    if (!deletedDestination) {
      res.status(402).json({ result: false, message: "place not found" });
    } else {
      res.status(200).json({
        result: true,
        deletedDestination,
        message: "Vous avez bien supprimé le voyage",
      });
    }
  } catch (error) {
    console.error({ error: error.message });
    res.status(500).json({ result: false, error: "An error occurred" });
  }
});
module.exports = router;
