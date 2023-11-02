const express = require("express");
const router = express.Router();
const Diary = require("../../models/diaries");
const Travel = require("../../models/travels");
const User = require("../../models/users");

const isAuthenticated = require("../../middleware/isAuthenticated");
router.get("/allPictures", isAuthenticated, async (req, res) => {
  try {
    // console.log(req.user.account.avatar);

    // const userId = req.query.userId;
    const user = await User.findOne({ avatar: req.user.avatar });
    // const travels = await User.find({ travels: req.body.travels });
    // console.log(travels);
    // console.log(user.travels);
    if (!user) {
      res.status(404).json({ result: false, error: "user not found" });
    }
    const travels = await Travel.find({ user: user._id });
    // console.log(travels);

    const diaryIds = [];
    for (const travel of travels) {
      diaryIds.push(...travel.travelDiary);
    }
    // console.log(diaryIds);
    const diaries = await Diary.find({ _id: { $in: diaryIds } });
    // console.log(diaries);
    const allImages = [];
    diaries.forEach((diary) => {
      allImages.push(
        ...diary.moment_pictures
        // .map((moment) => {
        //   // console.log(moment.secure_url);
        //   moment;
        //   // return moment;
        //   // console.log(allImages);
        // })
      );
    });

    if (allImages.length > 0) {
      res.json({ result: true, avatarUrl: user.account.avatar, allImages });
    } else {
      res.json({ result: true, avatarUrl: user.account.avatar, allImages: [] });
    }
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).json({ result: false, error: error.message });
  }
});

module.exports = router;