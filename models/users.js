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
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/i.test(v);
      },
      message: "Invalid email address format",
    },
  },
  password: String,
  token: String,
  hash: String,
  salt: String,

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
