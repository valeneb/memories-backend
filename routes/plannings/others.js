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
router.post("/newOther", async (req, res) => {
  try {
    const travelId = req.query.travelId;
    const travel = await Travel.findById(travelId);

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

    const otherBooking = await Travel.findByIdAndUpdate(
      travelId,
      {
        $push: { "travelPlanning.others": newOther },
      },
      { new: true }
    );

    const newOtherWithId =
      otherBooking.travelPlanning.others[
        otherBooking.travelPlanning.others.length - 1
      ];
    res.status(200).json({ result: true, other: newOtherWithId });
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

    const other = travel.travelPlanning.others.find(
      (otherItem) => otherId.toString() === otherItem._id.toString()
    );

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
      const update = travel.travelPlanning.others.id(otherId).set(other);

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

    const updatedTravel = await Travel.findOneAndUpdate(
      { _id: travelId },
      { $pull: { "travelPlanning.others": { _id: otherId } } },
      { new: true }
    );

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
// const express = require("express");
// const router = express.Router();
// const Diary = require("../../models/diaries");
// const Travel = require("../../models/travels");
// const User = require("../../models/users");

// const isAuthenticated = require("../../middleware/isAuthenticated");

// router.get("/allPictures", isAuthenticated, async (req, res) => {
//   try {
//     const user = await User.findOne({ _id: req.user._id });

//     if (!user) {
//       return res.status(404).json({ result: false, error: "user not found" });
//     }

//     const travels = await Travel.find({ user: user._id });

//     const allImagesByTravel = [];

//     for (const travel of travels) {
//       const destinationId = travel.destination; // Assumez que c'est une chaîne de caractères

//       // const diaryIds = [...travel.travelDiary, destinationId];
//       const diaries = await Diary.find({ travel: travel._id });

//       const images = [];
//       diaries.forEach((diary) => {
//         images.push(...diary.moment_pictures);
//       });

//       if (images.length > 0) {
//         allImagesByTravel.push({
//           // travel,
//           // destinationId, // Stockez l'ID de la destination
//           images,
//         });
//       }
//     }

//     res.json({
//       result: true,
//       avatarUrl: user.account.avatar || null,
//       allImagesByTravel,
//     });
//   } catch (error) {
//     console.log({ error: error.message });
//     res.status(500).json({ result: false, error: error.message });
//   }
// });

// module.exports = router;
