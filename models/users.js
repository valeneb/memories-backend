const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: String,
  firstname: String,
  lastname: String,
  email: String,
  password: String,
  token: String,
  isConnected: Boolean,
  phoneNumber: Number,
  birthDate: Date,
  language: String,
  avatar: { type: mongoose.Schema.Types.Mixed, default: {} },

  facebookId: String,
  displayName: String,
  email: String,
  profilePicture: String,
  longLivedToken: String,

  googleId: String,
  token: String,
  name: String,
  profilePicture: String,

  travels: [{ type: mongoose.Schema.Types.ObjectId, ref: "travel" }],
});
const User = mongoose.model("users", userSchema);
module.exports = User;
