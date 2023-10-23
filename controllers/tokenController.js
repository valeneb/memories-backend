// const express = require("express");
// const passport = require("passport");
// const FacebookStrategy = require("passport-facebook").Strategy;
// const session = require("express-session");
// const User = require("../models/users"); // Assurez-vous d'ajouter le chemin correct
// const crypto = require("crypto");
// const app = express();

// // Configuration de la session
// app.use(
//   session({
//     secret: crypto.randomBytes(64).toString("hex"),
//     resave: true,
//     saveUninitialized: true,
//   })
// );

// // Configuration de Passport
// app.use(passport.initialize());
// app.use(passport.session());

// // Configuration de la stratégie Facebook
// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: "867127584688440",
//       clientSecret: "2e75b7ad1ef3140b93ec23d4790471c0",
//       callbackURL: "http://localhost:3000/auth/facebook/callback",
//     },
//     (accessToken, refreshToken, profile, done) => {
//       // Créez un nouvel utilisateur en utilisant le modèle Mongoose
//       const newUser = new User({
//         facebook: {
//           id: profile.id,
//           token: accessToken,
//           name: profile.displayName,
//         },
//       });
//       console.log(newUser);
//       newUser.save((err) => {
//         if (err) {
//           return done(err, null);
//         }
//         return done(null, newUser);
//       });
//     }
//   )
// );

// // ... (le reste du code est inchangé)

// // Configuration de la sérialisation de l'utilisateur
// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser((id, done) => {
//   User.findById(id, (err, user) => {
//     done(err, user);
//   });
// });
const User = require("../models/users");
const Facebook = require("../config/facebook");
const axios = require("axios");

exports.generateToken = async (req, res) => {
  try {
    const { shortLivedToken, facebookId } = req.body;

    const response = await axios.get(
      `https://graph.facebook.com/v12.0/oauth/access_token?` +
        `grant_type=fb_exchange_token&` +
        `client_id=${Facebook.appID}&` +
        `client_secret=${Facebook.appSecret}&` +
        `fb_exchange_token=${shortLivedToken}`
    );

    const longLivedToken = response.data.access_token;
    console.log(response.data);
    // Store the long-lived token into the database
    const user = await User.findOneAndUpdate(
      { facebookId }, // The query to find the document
      { longLivedToken }, // The update operation
      { new: true, upsert: true } // Use upsert to create a new user if not found
    );

    if (user) {
      res.json({ message: "Token stored successfully", longLivedToken });
    } else {
      res.status(500).json({ message: "Token storage failed" });
    }
  } catch (error) {
    console.log({ error });
    console.error("Token exchange error:", error);
    res.status(500).json({ message: "Token exchange failed" });
  }
};

exports.retrieveInsights = (req, res) => {
  // Retrieve and return insights data
  res.json({ insights: "your-insights-data" });
};
