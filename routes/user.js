const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const cloudinary = require("cloudinary").v2;
const convertToBase64 = require("../utils/convertToBase64");
const Diary = require("../models/diaries");
const Travel = require("../models/travels");
const User = require("../models/users");

router.post("/signup", async (req, res) => {
  // const { username, password, email, firstname, lastname } = req.body;
  // console.log(req.files);
  try {
    const user = await User.findOne({
      email: req.body.email,
    });
    if (user) {
      return res
        .status(409)
        .json({ message: "This email already has an account" });
    } else {
      if (req.body.username && req.body.email && req.body.password) {
        const token = uid2(64);
        const salt = uid2(16);

        const hash = SHA256(req.body.password + salt).toString(encBase64);
        // console.log(hash);
        // console.log(salt);
        const newUser = await new User({
          salt: salt,
          hash: hash,
          token: token,
          email: req.body.email,
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          account: {
            username: req.body.username,
          },

          //!  password: password, ne pas enregistrer où le placer dans la nouvelle variable
        });
        // if (!req.files || !req.files.avatar) {
        //   return res.status(400).json({ message: "No file uploaded" });
        // }
        // console.log(req.files.avatar);
        if (req.files && req.files?.avatar) {
          const result = await cloudinary.uploader.upload(
            convertToBase64(req.files.avatar),

            {
              folder: `memories/users/${newUser._id}`,
              public_id: "avatar",
            }
          );
          ///${newUser._id}
          //! console.log(result); celui qui renvoie toutes les infos utilisateurs
          // console.log(req.files.avatar);
          newUser.account.avatar = result;
        }

        await newUser.save();
        res.status(201).json({
          user: {
            _id: newUser._id,
            token: newUser.token,
            email: newUser.email,
            account: newUser.account,
            lastname: newUser.lastname,
            firstname: newUser.firstname,
          },
        });
        console.log(newUser);
      } else {
        res.status(401).json({ message: "missing parameters" });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

// Define the login route
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      // Est-ce qu'il a rentré le bon mot de passe ?
      // req.body.password
      // user.hash
      // user.salt
      if (
        SHA256(req.body.password + user.salt).toString(encBase64) === user.hash
      ) {
        res.status(200).json({
          user: {
            // _id: user._id,
            token: user.token,
            email: user.email,
            account: user.account,
            lastname: user.lastname,
            firstname: user.firstname,
            travels: user.travels._id,
          },
        });
        // console.log(user);
      } else {
        res.status(401).json({ error: "Unauthorized" });
      }
    } else {
      res.status(400).json({ message: "User not found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

// TODO DELETE USER
// router.delete("/deleteUser", async (req, res) => {
//   console.log(req.query);
//   try {
//     if (!req.query.token) {
//       res.status(401).json({ result: false, message: "user not found" });
//       return;
//     }
//     const user = await User.findOne({ token: req.query.token });
//     const userToDelete = await User.deleteOne({ token: req.query.token });
//     // console.log(userToDelete);
//     console.log(user);
//     if (userToDelete.deletedCount > 0) {
//       await Travel.deleteMany({ user: userToDelete._id });
//       console.log(userToDelete);
//       const deletedTravelsIds = user.travels.foreach((travel) => {
//         travel._id;
//       });

//       await Diary.deleteMany({ travel: { $in: deletedTravelsIds } });
//       res.status(201).json({ reslut: true, user: userToDelete });
//     }
//   } catch (error) {
//     console.error({ error: error.message });
//     res.status(500).json({ result: false, error: "An error occurred" });
//   }
// });
router.delete("/deleteUser", async (req, res) => {
  console.log(req.query);
  try {
    if (!req.query.token) {
      res.status(401).json({ result: false, message: "user not found" });
      return;
    }
    const userToDelete = await User.findOneAndDelete({
      token: req.query.token,
    });
    if (userToDelete) {
      // Supprimer les voyages associés à l'utilisateur
      await Travel.deleteMany({ user: userToDelete._id });

      // Supprimer les journaux associés aux voyages supprimés
      await Diary.deleteMany({ travel: { $in: userToDelete.travels } });

      res.status(201).json({ result: true, user: userToDelete });
    } else {
      res.status(404).json({ result: false, message: "User not found" });
    }
  } catch (error) {
    console.error({ error: error.message });
    res.status(500).json({ result: false, error: "An error occurred" });
  }
});
// TODO UPDATE USER PROFIL AND TRY AGAIN WITH AVATAR
module.exports = router;
