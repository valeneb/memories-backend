const express = require("express");
const router = express.Router();
const Diary = require("../../models/diaries");
const Travel = require("../../models/travels");
const User = require("../../models/users");

const isAuthenticated = require("../../middleware/isAuthenticated");
// router.get("/allPictures", isAuthenticated, async (req, res) => {
//   try {
//     // console.log(req.user.account.avatar);

//     // const userId = req.query.userId;
//     const user = await User.findOne({ avatar: req.user.avatar });
//     // const travels = await User.find({ travels: req.body.travels });
//     // console.log(travels);

//     console.log(user.travels);
//     if (user) {
//       res.json({ result: true, avatarUrl: user.avatar });
//     } else {
//       res.status(404).json({ result: false, error: "user not found" });
//     }

//     // je voudrais dans les travels appartenant à un utilisateur toutes les images qui ont été enregistrés
//     // const userPictures = await find();
//     // je vais donc me concentrer sur les
//   } catch (error) {
//     console.log({ error: error.message });
//     res.status(500).json({ result: false, error: error.message });
//   }
// });
// router.get("/allPictures", isAuthenticated, async (req, res) => {
//   try {
//     // Find the user by their avatar URL
//     const user = await User.findOne({ avatar: req.user.avatar });

//     if (!user) {
//       return res.status(404).json({ result: false, error: "User not found" });
//     }
//     const diary = await Diary.find({ diary: req.body.moment_pictures });

//     if (diary) {
//       // Perform an aggregation query to retrieve images from related travels
//       const images = await Diary.aggregate([
//         {
//           $match: { _id: diary._id }, // Match the user by their _id
//         },
//         {
//           $unwind: "$moment_pictures", // Split the array into individual elements
//         },
//         {
//           $lookup: {
//             from: "moment_pictures", // The name of the collection containing travel documents
//             localField: "tmoment_pictures",
//             foreignField: "_id",
//             as: "travelDetails",
//           },
//         },
//         {
//           $unwind: "$travelDetails", // Split the travel details array
//         },
//         {
//           $project: {
//             _id: 0,
//             "travelDetails.images": 1, // Select only the 'images' field
//           },
//         },
//       ]);
//     }
//     console.log(images);
//     if (images && images.length > 0) {
//       // Extract the images from the result and send them to the front-end
//       const travelImages = images
//         .map((result) => result.travelDetails.images)
//         .flat();
//       res.json({ result: true, avatarUrl: user.avatar, travelImages });
//     } else {
//       res.json({ result: true, avatarUrl: user.avatar, travelImages: [] }); // No images found
//     }
//   } catch (error) {
//     console.log({ error: error.message });
//     res.status(500).json({ result: false, error: error.message });
//   }
// });

router.get("/allplannings", async (req, res) => {
  // nous avons dans la collection travel des tableaux ou je boucle sur chaque tableau  en filtrant ceux qui vont etre des images et je les récupères afin de recupérer
});
router.get("/allPictures", isAuthenticated, async (req, res) => {
  try {
    // Find the user by their avatar URL
    const user = await User.findOne({ avatar: req.user.avatar });

    if (!user) {
      return res.status(404).json({ result: false, error: "User not found" });
    }

    // Find all diaries for the user
    const diaries = await Diary.find({ user: user._id });
    // console.log(user);
    console.log(diaries);
    // Initialize an array to store all images and their associated titles
    const allImages = [];

    // Iterate through diaries to gather images and titles
    for (const diary of diaries) {
      console.log(diary);
      const diaryImages = diary.moment_pictures.map((moment) => ({
        title: diary.title,
        image: moment.image,
      }));
      allImages.push(...diaryImages);
      console.log(diaryImages);
    }

    if (allImages.length > 0) {
      res.json({ result: true, avatarUrl: user.avatar, allImages });
    } else {
      res.json({ result: true, avatarUrl: user.avatar, allImages: [] }); // No images found
    }
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).json({ result: false, error: error.message });
  }
});

module.exports = router;
