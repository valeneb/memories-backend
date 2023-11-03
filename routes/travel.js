const express = require("express");
const router = express.Router();
const User = require("../models/users");
const Travel = require("../models/travels");
const Diary = require("../models/diaries");
const cloudinary = require("cloudinary").v2;
const convertToBase64 = require("../utils/convertToBase64");
const isAuthenticated = require("../middleware/isAuthenticated");

// TODO CREATE NEWTRAVEL POST
// RECUPERE PLANNING POUR UN TRAVEL
router.get("/planning", async (req, res) => {
  try {
    const travelId = req.query.travelId;
    const userId = req.query.userId;

    if (!userId) {
      res.status(403).json({ result: false, error: "miss user id" });
    }

    if (!travelId) {
      res.status(403).json({ result: false, error: "miss travel id" });
    }

    const findTravel = await Travel.findById(travelId);

    if (!findTravel) {
      res.status(403).json({ result: false, error: "travel not found" });
    }
    if (findTravel.travelPlanning) {
      // console.log('planning', findTravel.travelPlanning);
      res
        .status(200)
        .json({ result: true, planning: findTravel.travelPlanning });
    } else {
      res
        .status(401)
        .json({ result: false, error: "you have to register a new travel" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post("/newTravel", isAuthenticated, async (req, res) => {
  try {
    // console.log(req.user);
    if (req.user) {
      // Convert the dates from "DD/MM/YYYY" to valid JavaScript format "YYYY-MM-DD"
      const departureDateParts = req.body.departure.split("/");
      const formattedDepartureDate = `${departureDateParts[2]}-${departureDateParts[1]}-${departureDateParts[0]}`;
      const returnDateParts = req.body.return.split("/");
      const formattedReturnDate = `${returnDateParts[2]}-${returnDateParts[1]}-${returnDateParts[0]}`;
      const latitude = parseFloat(req.body.latitude);
      const longitude = parseFloat(req.body.longitude);

      const newTrip = new Travel({
        destination: req.body.destination,
        departure: formattedDepartureDate,
        return: formattedReturnDate,
        location: {
          type: "Point",
          coordinates: [latitude, longitude],
        },
        user: req.user._id,
      });

      if (req.files || req.files?.coverImage) {
        const resultToUpload = await cloudinary.uploader.upload(
          convertToBase64(req.files.coverImage),
          {
            folder: `memories/travelsCover/${newTrip._id}`,
            public_id: "coverImage",
          }
        );

        newTrip.coverImage = resultToUpload.secure_url;
        // newTrip.coverImage = resultToUpload.public_id;
      }

      // Save the newTrip first
      const savedTrip = await newTrip.save();

      // Now, update the user's travels
      const user = await User.findById(req.user._id);
      user.travels.push(savedTrip._id);
      await user.save();

      res.status(200).json({ result: true, trip: savedTrip });
    }
  } catch (error) {
    console.error({ error: error.message });
    res.status(400).json({ result: false, error: "Wrong" });
  }
});

// TODO GET but POST because the front doesn't want to accept to GET method by req.body TO GET ALL TRAVELS
router.get("/", async (req, res) => {
  // console.log(req.query);
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
  const travelId = req.query._id;
  // console.log(travelId);
  if (!travelId) {
    return res.status(400).json({
      result: false,
      error: "You must provide the _id of the travel to update.",
    });
  }
  try {
    const travelToModify = await Travel.findOne({ _id: travelId });

    // console.log(travelToModify);
    if (req.body.destination) {
      travelToModify.destination = req.body.destination;
      // console.log(travelToModify.destination);
    }
    if (req.body.departure) {
      const departureDateParts = req.body.departure.split("/");
      const formattedDepartureDate = `${departureDateParts[2]}-${departureDateParts[1]}-${departureDateParts[0]}`;
      travelToModify.departure = formattedDepartureDate;
    }
    if (req.body.return) {
      const returnDateParts = req.body.return.split("/");
      const formattedReturnDate = `${returnDateParts[2]}-${returnDateParts[1]}-${returnDateParts[0]}`;
      travelToModify.return = formattedReturnDate;
    }
    if (req.body.latitude) {
      travelToModify.location.coordinates[0] = parseFloat(req.body.latitude);
      // console.log(travelToModify.location.coordinates[0]);
    }
    if (req.body.longitude) {
      travelToModify.location.coordinates[1] = parseFloat(req.body.longitude);
      // console.log(travelToModify.location.coordinates[1]);
    }
    if (req.files?.image) {
      if (!travelToModify.coverImage) {
        travelToModify.coverImage = {};
      }
      // console.log(req.files);

      if (travelToModify.coverImage.public_id) {
        //!si ce console.log apparaît id undefined controle de la route post et le folder d'nvoie cloudinary à revoir
        // console.log(travelToModify.coverImage.public_id);
        await cloudinary.uploader.destroy(travelToModify.coverImage.public_id);
      }

      const uploadedCoverImage = await cloudinary.uploader.upload(
        convertToBase64(req.files.image),
        {
          folder: `memories/travelsCover/${travelToModify._id}`,
          public_id: "coverImage",
        }
      );
      // console.log(uploadedCoverImage);
      travelToModify.coverImage = uploadedCoverImage.secure_url;
      // travelToModify.coverImage = uploadedCoverImage.public_id;
    }
    // console.log(travelToModify);
    // Effectuez la mise à jour en utilisant findOneAndUpdate.
    const updatedTravel = await Travel.findByIdAndUpdate(
      { _id: travelId },
      { $set: travelToModify },
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
  const travelId = req.query.travelId;
  const userId = req.query.userId;
  if (!travelId) {
    return res.status(400).json({
      result: false,
      error: "You must provide the _id of the travel to delete.",
    });
  }

  try {
    if (travelId) {
      const deletedDestination = await Travel.findOneAndDelete({
        _id: travelId,
      });
      // const updateUserTravel =
      await User.findByIdAndUpdate(
        userId,
        { $pull: { travels: travelId } },
        { new: true }
      );
      // console.log(updateUserTravel);
      if (!deletedDestination) {
        return res
          .status(402)
          .json({ result: false, message: "place not found" });
      }
      if (deletedDestination) {
        await Diary.deleteMany({ travel: deletedDestination._id });
      }

      if (deletedDestination) {
        await cloudinary.api.delete_resources_by_prefix(
          `memories/travelsCover/${travelId}`
        );
        await cloudinary.api.delete_folder(`memories/travelsCover/${travelId}`);
      }

      //   console.log(diariesDeleted);
      return res.status(200).json({
        result: true,
        travel: deletedDestination,
        message: "Vous avez bien supprimé le voyage",
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ result: false, error: "An error occurred" });
  }
});

module.exports = router;
