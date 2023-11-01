const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  account: {
    username: {
      required: true,
      type: String,
    },
    avatar: Object,
  },

  firstname: String,
  lastname: String,
  email: {
    unique: true,
    type: String,
  },
  password: String,
  token: String,
  hash: String,
  salt: String,
  isConnected: Boolean,
  phoneNumber: Number,
  birthDate: Date,
  language: String,
  avatar: Object,



  travels: [{ type: mongoose.Schema.Types.ObjectId, ref: "travel" }],
});
const User = mongoose.model("users", userSchema);
module.exports = User;
  // facebookId: String,
  // name: String,
  // email: String,
  //  profilePicture: String,
  // longLivedToken: String,

  // googleId: String,
  // token: String,
  // name: String,
  // profilePicture: String,