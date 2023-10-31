const express = require("express");
const router = express.Router();
const Travel = require("../../models/travels");
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
      travelPlanning = [{ carRental: [] }];
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
      const rentalStartDateParts = req.body.rentalStart.split("/");
      const rentalEndDateParts = req.body.rentalEnd.split("/");
      const formattedStartDate = `${rentalStartDateParts[2]}-${rentalStartDateParts[1]}-${rentalStartDateParts[0]}`;
      const formattedEndDate = `${rentalEndDateParts[2]}-${rentalEndDateParts[1]}-${rentalEndDateParts[0]}`;
      const newCar = {
        carBrand,
        carModel,
        licensePlate,
        rentalCompany,
        comments,
        price,
        rentalStart: formattedStartDate,
        rentalEnd: formattedEndDate,
      };
      console.log(newCar);
      const updateTravelCarRental = await Travel.findByIdAndUpdate(
        req.query._id,
        { $push: { "travelPlanning.carRental": newCar } }
      );
      await travel.save();
      //   console.log((travel.travelPlanning.carRental = [...newCar]));
      res.status(200).json({ result: true, travel: updateTravelCarRental });
    }
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
    const carRental = travel.travelPlanning.carRental;
    console.log(carRental);
    res.status(200).json({ result: true, carRental });
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

    const carRental = travel.travelPlanning.carRental.find(
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
      await travel.travelPlanning.carRental.id(carRentalId).set(carRental);
      //   console.log(victoire);
      const updatedCarRental = await travel.save();
      res.status(200).json({ result: true, carRental: updatedCarRental });
    }
  } catch (error) {
    console.error({ error: error.message });
    res.status(500).json({ result: false, error: error.message });
  }
});

router.delete("/deleteCarRental", async (req, res) => {
  //   console.log(req.query);
  try {
    const travelId = req.query.travelId;
    const carRentalId = req.query.carRentalId;
    const travel = await Travel.findById(travelId);
    // console.log(travelId);
    if (!travel) {
      res.status(404).json({ resukt: false, error: error.message });
    }
    // console.log(carRentalId);
    if (!carRentalId) {
      res.status(404).json({
        result: false,
        error: "This rent is not found here you have to create it",
      });
    }

    const carRentalToDelete = await Travel.findOneAndUpdate({
      carRentalId: carRentalId,
    });
    // console.log(indexOf(carRentalToDelete));
    if (carRentalToDelete.deletedCount >= 0) {
      res.status(200).json({ result: true, travel: carRentalToDelete });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ result: false, error: "An error occurred" });
  }
});
// router.delete("/deleteCarRental", async (req, res) => {
//   try {
//     const travelId = req.query._id;
//     const carRentalId = req.query._id;
//     const travel = await Travel.findById(travelId);

//     if (!travel) {
//       const error = new Error("Travel not found");
//       res.status(404).json({ result: false, error: error.message });
//     }

//     if (!carRentalId) {
//       res.status(404).json({
//         result: false,
//         error: "This rent is not found here you have to create it",
//       });
//     }

//     if (carRentalId) {
//       const carRentalToDelete = await Travel.findOneAndDelete({
//         _id: carRentalId,
//       });

//       if (carRentalToDelete && carRentalToDelete.deletedCount > 0) {
//         res.status(200).json({ result: true, travel: carRentalToDelete });
//       }
//     }
//   } catch (error) {
//
//   }
// });

module.exports = router;
