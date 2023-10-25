const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const fileUpload = require("express-fileupload");
const convertToBase64 = require("../utils/convertToBase64");
const cloudinary = require("cloudinary").v2;

const User = require("../models/users");

router.post("/signup", fileUpload(), async (req, res) => {
  // const { username, password, email, firstname, lastname } = req.body;

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
        console.log(hash);
        console.log(salt);
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

        if (req.files?.avatar) {
          const result = await cloudinary.uploader.upload(
            convertToBase64(req.files.avatar),

            {
              folder: `api/memories/users/${newUser._id}`,
              public_id: `avatar`,
            }
          );
          console.log(req.files.avatar);
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
        res.status(400).json({ message: "missing parameters" });
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
          },
        });
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
// router.get("/:id", async (req, res) => {
//   console.log(req);
//   try {
//     const userId = req.params._id;
//     const user = await User.findById(userId).populate("travels");

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json(user);
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).json({ message: error.message });
//   }
// });
module.exports = router;
