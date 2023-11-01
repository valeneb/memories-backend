const express = require("express");
const router = express.Router();
const Travel = require("../../models/travels");
function getDefault(value, defaultValue = "") {
  return value ? value : defaultValue;
}

function formatDate(date) {
  if (date) {
    // console.log(date);
    const dateParts = date.split("/");
    return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
  }
  return null;
}

function formatTime(time) {
  if (time) {
    const date = new Date(`1970-01-01T${time}`);
    date.setHours(date.getHours() + 1);
    return date;
  }
  return null;
}
router.post("/newOther", async (req, res) => {
  try {
    const travelId = req.query.travelId;
    const travel = await Travel.findById(travelId);
    // console.log(travel);
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
      travel.travelPlanning = { others: [] };
    }
    const { title, comments, price } = req.body;
    const formattedDate = formatDate(req.body.date);
    const formattedHour = formatTime(req.body.hour);

    const newOther = {
      title: getDefault(title),
      comments: getDefault(comments),
      price: getDefault(price, 0),
      date: formattedDate,
      hour: formattedHour,
    };
    // console.log(newOther);
    // console.log(travelId.travelPlanning);
    // if (travel.travelPlanning.others.length >= 0) {
    //   travel.travelPlanning.others.push(newOther);
    //   travel.save();
    const otherBooking = await Travel.findByIdAndUpdate(
      travelId,
      {
        $push: { "travelPlanning.others": newOther },
      },
      { new: true }
    );
    console.log(otherBooking);
    const newOtherWithId =
      otherBooking.travelPlanning.others[
        otherBooking.travelPlanning.others.length - 1
      ];
    res.status(200).json({ result: true, travel: newOtherWithId });
    // }
  } catch (error) {
    console.error({ error: error.message });
    res.status(500).json({ result: false, error: error.message });
  }
});
router.put("/updateOther", async (req, res) => {
  try {
    const travelId = req.query.travelId;
    const otherId = req.query.otherId;
    console.log(travelId);
    console.log(otherId);
    const travel = await Travel.findById(travelId);
    if (!travel) {
      return res.status(404).json({ result: false, error: "Travel not found" });
    }
    // console.log(travel.travelPlanning.others);
    const other = travel.travelPlanning.others.find(
      (otherItem) => otherId.toString() === otherItem._id.toString()
    );
    // console.log(other);
    if (!other) {
      return res.status(404).json({ result: false, error: error.message });
    }
    if (other) {
      if (req.body.title) {
        other.title = req.body.title;
      }
      if (req.body.comments) {
        other.comments = req.body.comments;
      }
      if (req.body.price) {
        other.price = req.body.price;
      }
      if (req.body.date) {
        const formattedDate = formatDate(req.body.date);
        other.date = formattedDate;
      }
      if (req.body.hour) {
        const formattedHour = formatTime(req.body.hour);
        other.hour = formattedHour;
      }
      const update = await travel.travelPlanning.others.id(otherId).set(other);
      //   const updatedCarRental =
      await travel.save();
      return res.status(200).json({ result: true, other: update });
    }
  } catch (error) {
    console.error({ error: error.message });
  }
});
router.delete("/deleteOther", async (req, res) => {
  try {
    const travelId = req.query.travelId;
    const otherId = req.query.otherId;

    console.log(travelId);
    if (!otherId) {
      return res.status(404).json({
        result: false,
        error: "other not found in this travel",
      });
    }
    const travel = await Travel.findOne({ _id: travelId });
    const other = travel.travelPlanning.others.find(
      (otherItem) => otherId.toString() === otherItem._id.toString()
    );
    if (!travelId && travel) {
      return res.status(404).json({
        result: false,
        error: "Travel not found",
      });
    }
    if (!other) {
      return res
        .status(404)
        .json({ result: false, error: "other not found in the planning" });
    }
    // console.log(other);

    const updatedTravel = await Travel.findOneAndUpdate(
      { _id: travelId },
      { $pull: { "travelPlanning.others": { _id: otherId } } },
      { new: true }
    );
    // console.log(updatedTravel);
    if (!updatedTravel) {
      return res.status(404).json({ result: false, error: "Travel not found" });
    }
    const updatedOthers = updatedTravel.travelPlanning.others;
    return res.status(200).json({ result: true, other: updatedOthers });
  } catch (error) {
    return res.status(500).json({ result: false, error: "An error occurred" });
  }
});
module.exports = router;
