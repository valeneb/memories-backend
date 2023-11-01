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
    travel.travelPlanning = [{ accomodations: [] }];
  }
  try {
    //? hotelName, address, checkinDate, checkOutDate, roomNumber,comments,price
    const { hotelName, address, roomNumber, comments, price } = req.body;

    const formattedCheckInDate = formatDate(req.body.checkInDate);
    const formattedCheckOutDate = formatDate(req.body.checkOutDate);
    const newAccomodation = {
      hotelName: getDefault(hotelName),
      address: getDefault(address),
      checkInDate: formattedCheckInDate,
      checkOutDate: formattedCheckOutDate,
      comments: getDefault(comments),
      roomNumber: getDefault(roomNumber, 0),
      price: getDefault(price, 0),
    };
    const accomodationReservation = await Travel.findByIdAndUpdate(
      req.query._id,
      {
        $push: { "travelPlanning.accomodations": newAccomodation },
      }
    );
    const travelIdOfaccomodationReservation = accomodationReservation._id;
    const newAccomodationWithId =
      accomodationReservation.travelPlanning.accomodations[
        accomodationReservation.travelPlanning.accomodations.length - 1
      ];
    res.status(200).json({
      result: true,
      travel: newAccomodationWithId,
      travelIdOfaccomodationReservation,
    });
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
    const accommodations = travel.travelPlanning.accomodations;
    res.status(200).json({ result: true, accommodations });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ result: false, error: "wrong course in this road" });
  }
});
router.put("/update", async (req, res) => {
  try {
    const travelId = req.query.travelId;
    const accomodationId = req.query.accomodationId;

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
      travel.travelPlanning.accomodations.id(accomodationId);
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
    const updatedTravel = await travel.save();

    res.status(200).json({ result: true, travel: updatedTravel });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ result: false, error: error.message });
  }
});
router.delete("/deleteAccommodation", async (req, res) => {
  try {
    const travelId = req.query.travelId;
    const accommodationId = req.query.accommodationId;
    console.log(accommodationId);
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
    if (accommodationId) {
      const accommodationToDelete = await Travel.findOneAndUpdate(
        { _id: travelId },
        { $pull: { "travelPlanning.accomodations": { _id: accommodationId } } }
      );
      res.status(200).json({ result: true, travel: accommodationToDelete });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ result: false, error: error.message });
  }
});
module.exports = router;
// router.put("/update", async (req, res) => {
//   try {
//     console.log(req.query);
//     const travelId = req.query.travelId;
//     const accomodationId = req.query.accomodationId;
//     // Find the travel by ID
//     const travel = await Travel.findById(travelId);
//     console.log(travel);
//     if (!travel) {
//       return res.status(404).json({
//         result: false,
//         error: "Travel not found",
//       });
//     }
//     const accommodation = travel.travelPlanning.accomodations.find(
//       (accomodationItem) =>
//         accomodationId.toString() === accomodationItem.toString()
//     );
//     console.log(accommodation);
// if (!accommodation) {
//   res.status(404).json({
//     result: false,
//     error: "accomodation not found in this travel",
//   });
// }
// if (accommodation) {
//   //? hotelName, address, checkinDate, checkOutDate, roomNumber,comments,price
//   if (req.body.hotelName) {
//     accommodation.hotelName = req.body.hotelName;
//   }
//   //   accommodation.hotelName = getDefault(req.body.hotelName);
//   if (req.body.address) {
//     accommodation.address = req.body.adress;
//   }
//   if (req.body.checkInDate) {
//     accommodation.checkInDate = req.body.checkInDate;
//   }
//   if (req.body.checkOutDate) {
//     accommodation.checkOutDate = req.body.checkOutDate;
//   }
//   if (req.body.roomNumber) {
//     accommodation.roomNumber = req.body.roomNumber;
//   }
//   if (req.body.comments) {
//     accommodation.comments = req.body.comments;
//   }
//   if (req.body.price) {
//     accommodation.price = req.body.price;
//   }
//   await travel.travelPlanning.accomodations
//     .id(accomodationId)
//     .set(accommodation);
//   const updatedTravel = await travel.save();
//   res.status(200).json({ result: true, travel: updatedTravel });
// }
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ result: false, error: error.message });
//   }
// });
module.exports = router;
