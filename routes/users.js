require("../config/database");
const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const uniqid = require("uniqid");
const bcrypt = require("bcrypt");
const uid2 = require("uid2");
// const passport = require("passport");
const authController = require("../controllers/authController");
// const convertToBase64 = require("../utils/convertToBase64");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");

router.post("/signup/upload", fileUpload(), async (req, res) => {
  try {
    const photoPath = `./tmp/${uniqid()}.jpg`;
    const resultMove = await req.files.photoFromFront.mv(photoPath);

    if (!resultMove) {
      const resultCloudinary = await cloudinary.uploader.upload(photoPath);
      const newUser = new User({
        avatar: {
          // Store the secure URL of the uploaded image
          profilePicture: resultCloudinary.secure_url,
        },
      });
      await newUser.save();
      res.json({ result: true, url: resultCloudinary.secure_url });
    } else {
      res.json({ result: false, error: resultMove });
    }
    fs.unlinkSync(photoPath);
  } catch (error) {
    res.status(500).json({ error: "Une erreur s'est produite" });
  }
});

/* GET users listing. */

// Route d'inscription (signup)
router.post("/signup", fileUpload(), async (req, res) => {
  if (
    !checkBody(req.body, [
      "username",
      "firstname",
      "lastname",
      "email",
      "password",
    ])
  ) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  try {
    const { username, firstname, lastname, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "Cet email est déjà utilisé" });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        username,
        firstname,
        lastname,
        email,
        password: hashedPassword,
        token: uid2(32),
      });
      await newUser.save();
      res.status(201).json({ message: "Inscription réussie" });
    }
  } catch (error) {
    res.status(500).json({ error: "Une erreur s'est produite" });
  }
});

// TODO routes facebook connection
// !ROUTE EN POST
router.post("/facebook", authController.facebookLogin);

// TODO en Suspens ainsi que le token test
// TODO  token test connection Facebook:!EAAEf8IabEEABOy6abRMuNGldfFa6RwNNQkfdZB9AbGp6s6MWb4Qu6xO80amaXDalVBQ9bPeUfTEpaDwJ3H0hOp9JdrjFo36ElRCU4L4X9bZA4fxSpJkxG01xjP9JqBVky4iAnTQsErzKDPIHiKE8x3jNLrOJvdl47ZA4Ji3e7SnEliNkX1w9Jw8V8p2SRVCUoR75q4xoGgaq3P1fNa0O1jllWd0kkTaSucTwCthxfZB7XpmmfZAfMYSrWcKA3vLsZD
// Route d'authentification Facebook
// router.get("/auth/facebook", passport.authenticate("facebook"));

// router.get(
//   "/auth/facebook/callback",
//   passport.authenticate("facebook", {
//     successRedirect: "/success",
//     failureRedirect: "/failure",
//   })
// );
// // Route pour le succès de l'authentification
// router.get("/success", (req, res) => {
//   res.send("Authentification avec Facebook réussie.");
// });

// // Route pour l'échec de l'authentification
// router.get("/failure", (req, res) => {
//   res.send("Authentification avec Facebook échouée.");
// });

// // Callback de Facebook avec génération du jeton JWT
// router.get(
//   "/auth/facebook/callback",
//   passport.authenticate("facebook", {
//     successRedirect: "/success",
//     failureRedirect: "/failure",
//   }),
//   (req, res) => {
//     // Générez le jeton JWT ici
//     const user = req.user; // Récupérez l'utilisateur depuis la requête
//     const token = jwt.sign({ user }, "your-secret-key", { expiresIn: "1h" }); // Personnalisez les paramètres d'expiration
//     res.header("x-auth-token", token).redirect("/success");
//   }
// );
// Route protégée par JWT
// router.get("/protected-route", authenticateJWT, (req, res) => {
//   console.log(req);
//   console.log(authenticateJWT);
//   res.send("Route protégée par JWT.");
// });

// Démarrer le serveur
// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//   console.log(`Serveur en cours d'exécution sur le port ${port}`);
// });
module.exports = router;
