const express = require("express");
const router = express.Router();
const Diary = require("../../models/diaries");
const Travel = require("../../models/travels");
const User = require("../../models/users");

const isAuthenticated = require("../../middleware/isAuthenticated");
router.get("/allPictures", isAuthenticated, async (req, res) => {
  try {
    console.log(req.user.account.avatar);
    const secureUrl = req.user.account.avatar.toString();
    // const userId = req.query.userId;
    const user = await User.findOne({ secureUrl });
    console.log(user);

    // je voudrais dans les travels appartenant à un utilisateur toutes les images qui ont été enregistrés
    // const userPictures = await find();
    // je vais donc me concentrer sur les
  } catch (error) {
    console.log({ error: error.message });
    res.status(500).json({ result: false, error: error.message });
  }
});

router.get("/allplannings", async (req, res) => {
  // nous avons dans la collection travel des tableaux ou je boucle sur chaque tableau  en filtrant ceux qui vont etre des images et je les récupères afin de recupérer
});

module.exports = router;
