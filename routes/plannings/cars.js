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
router.post("/newCar", async (req, res) => {
  try {
    // const travelId = req.query.travelId;
    const travel = await Travel.findById(req.query._id);
    // console.log(travel.travelPlanning);
    if (!travel) {
      res.status(402).json({
        result: false,
        error: "something wrong you have to search a right travel ",
      });
    }
    if (
      !travel.travelPlanning ||
      !Array.isArray(travel.travelPlanning) ||
      travel.travelPlanning.length === 0
    ) {
      travel.travelPlanning = { carRentals: [] };
    }
    if (travel._id) {
      const {
        carBrand,
        carModel,
        licensePlate,
        rentalCompany,
        comments,
        price,
      } = req.body;

      const formattedStartDate = formatDate(req.body.rentalStart);
      const formattedEndDate = formatDate(req.body.rentalEnd);
      const newCar = {
        carBrand: getDefault(carBrand),
        carModel: getDefault(carModel),
        licensePlate: getDefault(licensePlate),
        rentalCompany: getDefault(rentalCompany),
        comments: getDefault(comments),
        price: getDefault(price, 0),
        rentalStart: formattedStartDate,
        rentalEnd: formattedEndDate,
      };
      // console.log(newCar);
      // const updateTravelCarRental =
      const carReservation = await Travel.findByIdAndUpdate(
        req.query._id,
        {
          $push: { "travelPlanning.carRentals": newCar },
        },
        { new: true }
      );
      // await travel.save();

      //   console.log((travel.travelPlanning.carRental = [...newCar]));

      const newCarWithId =
        carReservation.travelPlanning.carRentals[
          carReservation.travelPlanning.carRentals.length - 1
        ];
      res.status(200).json({ result: true, travel: newCarWithId });
      //   const findDocumentWithId = await travel.travelPlanning.carRental.findOne({
      //     _id: newCar._id,
      //   });
      //   res.status(201).json({ result: found, travel: findDocumentWithId });
    }
    // TODO JUST SEND TO THE FRONT ELEMENT CREATED
  } catch (error) {
    console.error({ error: error.message });
    res.status(500).json({ result: false, error: error.message });
  }
});
router.get("/", async (req, res) => {
  console.log(req.query.travelId);

  const travelId = req.query.travelId;
  try {
    const travel = await Travel.findById(travelId);
    if (!travel) {
      res.json(404).json({ result: false, error: "Travel not found" });
    }
    const carRental = travel.travelPlanning.carRentals;
    console.log(carRental);
    res.status(200).json({ result: true, travel: carRental });
  } catch (error) {
    console.error({ error: error.message });
    res.status(500).json({ result: false, error: "An error occured" });
  }
});

router.put("/updateCarRental", async (req, res) => {
  //   console.log(req.query);
  try {
    const travelId = req.query.travelId;
    const carRentalId = req.query.carRentalId;
    const travel = await Travel.findById(travelId);
    if (!travel) {
      res.status(404).json({ result: false, error: "Travel not found" });
    }

    const carRental = travel.travelPlanning.carRentals.find(
      (carRentalItem) => carRentalId.toString() === carRentalItem._id.toString()
    );
    if (!carRental) {
      res.status(404).json({ result: false, error: error.message });
    }
    if (carRental) {
      if (req.body.carBrand) {
        carRental.carBrand = req.body.carBrand;
      }
      if (req.body.carModel) {
        carRental.carModel = req.body.carModel;
      }
      if (req.body.licensePlate) {
        carRental.licensePlate = req.body.licensePlate;
      }
      if (req.body.rentalCompany) {
        carRental.rentalCompany = req.body.rentalCompany;
      }
      if (req.body.comments) {
        carRental.comments = req.body.comments;
      }
      if (req.body.price) {
        carRental.price = req.body.price;
      }
      if (req.body.rentalStart) {
        const rentalStartDateParts = req.body.rentalStart.split("/");
        const formattedStartDate = `${rentalStartDateParts[2]}-${rentalStartDateParts[1]}-${rentalStartDateParts[0]}`;
        carRental.price = formattedStartDate;
      }
      if (req.body.rentalEnd) {
        const rentalEndDateParts = req.body.rentalEnd.split("/");
        const formattedEndDate = `${rentalEndDateParts[2]}-${rentalEndDateParts[1]}-${rentalEndDateParts[0]}`;
        carRental.rentalEnd = formattedEndDate;
      }

      //   const victoire =
      const updatedCarRental = travel.travelPlanning.carRentals
        .id(carRentalId)
        .set(carRental);
      //   console.log(victoire);
      // TODO JUST SEND TO THE FRONT ELEMENT UPDATE
      // const updatedCarRental =
      await travel.save();
      res.status(200).json({ result: true, travel: updatedCarRental });
    }
  } catch (error) {
    console.error({ error: error.message });
    res.status(500).json({ result: false, error: error.message });
  }
});

router.delete("/deleteCarRental", async (req, res) => {
  try {
    const travelId = req.query.travelId;
    const carRentalId = req.query.carRentalId;

    if (!travelId) {
      return res.status(404).json({
        result: false,
        error: "Travel not found",
      });
    }

    if (!carRentalId) {
      return res.status(404).json({
        result: false,
        error: "Car rental not found in this travel",
      });
    }

    const travel = await Travel.findById(travelId);

    if (!travel) {
      return res.status(404).json({ result: false, error: "Travel not found" });
    }

    const carRentalToDelete = await Travel.findOneAndUpdate(
      { _id: travelId },
      { $pull: { "travelPlanning.carRentals": { _id: carRentalId } } },
      { new: true }
    ).select("travelPlanning.carRentals");

    if (
      !carRentalToDelete ||
      carRentalToDelete.travelPlanning.carRentals.length === 0
    ) {
      return res.status(404).json({
        result: false,
        error: "Car rental not found in this travel",
      });
    }

    const deletedCarRental = carRentalToDelete.travelPlanning.carRentals;
    res.status(200).json({ result: true, carRental: deletedCarRental });
  } catch (error) {
    return res.status(500).json({ result: false, error: "An error occurred" });
  }
});

module.exports = router;
