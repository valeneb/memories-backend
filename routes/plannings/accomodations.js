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

router.post("/newAccomodation", async (req, res) => {
  const travel = await Travel.findById(req.query._id);
  //   console.log(travel);
  if (!travel) {
    res.status(404).json({ result: false, error: "not travel id found" });
  }
  if (
    !travel.travelPlanning ||
    !Array.isArray(travel.travelPlanning) ||
    travel.travelPlanning.length === 0
  ) {
    travel.travelPlanning = { accommodations: [] };
  }
  try {
    //? hotelName, address, checkinDate, checkOutDate, roomNumber,comments,price
    const { hotelName, address, roomNumber, comments, price } = req.body;

    const formattedCheckInDate = formatDate(req.body.checkInDate);
    const formattedCheckOutDate = formatDate(req.body.checkOutDate);
    const newAccommodation = {
      hotelName: getDefault(hotelName),
      address: getDefault(address),
      checkInDate: formattedCheckInDate,
      checkOutDate: formattedCheckOutDate,
      comments: getDefault(comments),
      roomNumber: getDefault(roomNumber, 0),
      price: getDefault(price, 0),
    };
    // if (travel.travelPlanning.accommodations.length >= 0) {
    //   travel.travelPlanning.accommodations.push(newOther);
    //   travel.save();
    const accommodationReservation = await Travel.findByIdAndUpdate(
      req.query._id,
      {
        $push: { "travelPlanning.accommodations": newAccommodation },
      },
      { new: true }
    );
    // const travelIdOfaccommodationReservation = accommodationReservation._id;
    const newAccommodationWithId =
      accommodationReservation.travelPlanning.accommodations[
        accommodationReservation.travelPlanning.accommodations.length - 1
      ];
    res.status(200).json({
      result: true,
      accommodation: newAccommodationWithId,
      //   travelIdOfaccommodationReservation,
    });
    // }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({});
  }
});
router.get("/", async (req, res) => {
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
    const accommodations = travel.travelPlanning.accommodations;
    res.status(200).json({ result: true, accommodations });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ result: false, error: "wrong course in this road" });
  }
});
router.put("/update", async (req, res) => {
  //   console.log(req.query);
  try {
    const travelId = req.query.travelId;
    const accommodationId = req.query.accommodationId;

    // Trouver le voyage par son ID
    const travel = await Travel.findById(travelId);
    if (!travel) {
      return res.status(404).json({
        result: false,
        error: "Voyage introuvable",
      });
    }

    // Trouver l'hébergement dans le voyage
    const accommodation =
      travel.travelPlanning.accommodations.id(accommodationId);
    // console.log()
    if (!accommodation) {
      return res.status(404).json({
        result: false,
        error: "Hébergement introuvable dans ce voyage",
      });
    }

    // Mettre à jour les propriétés de l'hébergement si elles sont présentes dans la requête
    if (req.body.hotelName) {
      accommodation.hotelName = req.body.hotelName;
    }
    if (req.body.address) {
      accommodation.address = req.body.address;
    }
    if (req.body.checkInDate) {
      accommodation.checkInDate = req.body.checkInDate;
    }
    if (req.body.checkOutDate) {
      accommodation.checkOutDate = req.body.checkOutDate;
    }
    if (req.body.roomNumber) {
      accommodation.roomNumber = req.body.roomNumber;
    }
    if (req.body.comments) {
      accommodation.comments = req.body.comments;
    }
    if (req.body.price) {
      accommodation.price = req.body.price;
    }

    // Sauvegarder les modifications du voyage
    // const updatedTravel =
    await travel.save();
    // travel: updatedTravel
    res.status(200).json({
      result: true,
      accommodation: accommodation,
      travelId: travel._id,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ result: false, error: error.message });
  }
});

router.delete("/deleteAccommodation", async (req, res) => {
  try {
    const travelId = req.query.travelId;
    const accommodationId = req.query.accommodationId;

    const travel = await Travel.findById(travelId);
    if (!travel) {
      return res.status(404).json({
        result: false,
        error: "Travel not found",
      });
    }

    if (!accommodationId) {
      return res.status(404).json({
        result: false,
        error: "Hébergement introuvable dans ce voyage",
      });
    }

    // const accommodationToDelete =
    await Travel.findById(travelId)
      .select("travelPlanning.accommodations")
      .lean();
    const deletedAccommodation = await Travel.findOneAndUpdate(
      { _id: travelId },
      { $pull: { "travelPlanning.accommodations": { _id: accommodationId } } },
      { new: true }
    ).select("travelPlanning.accommodations");
    // projection: { "travelPlanning.accommodations.$": 1 }
    if (
      !deletedAccommodation ||
      deletedAccommodation.travelPlanning.accommodations.length === 0
    ) {
      return res.status(404).json({
        result: false,
        error: "Hébergement introuvable dans ce voyage",
      });
    }
    const deletedSubdocument =
      deletedAccommodation.travelPlanning.accommodations;
    // accommodationToDelete
    res.status(200).json({ result: true, accommodation: deletedSubdocument });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ result: false, error: error.message });
  }
});
module.exports = router;
