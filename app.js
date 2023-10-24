require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const passport = require("passport");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const fileUpload = require("express-fileupload");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
// const authRoute = require("./routes/auth");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

var app = express();
const cors = require("cors");

app.use(cors());

app.use(fileUpload());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
require("./config/database");
app.use("/", indexRouter);
app.use("/user", usersRouter);

module.exports = app;
