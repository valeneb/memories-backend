const passport = require("passport");

exports.facebookLogin = passport.authenticate("facebook", {
  scope: ["email"], // Specify the Facebook permissions you need
});

exports.facebookLoginCallback = (req, res) => {
  // Handle the Facebook login callback
  res.json({ message: "Facebook login callback" });
};
