require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const passport = require("passport");
var express = require("express");
var path = require("path");
const bodyParser = require("body-parser");

// ...

var cookieParser = require("cookie-parser");
var logger = require("morgan");
const fileUpload = require("express-fileupload");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/user");
const travelRouter = require("./routes/travel");
const diaryRouter = require("./routes/diary");
// const authRoute = require("./routes/auth");
cloudinary.config({
  cloud_name: "dbmg2zl7x",
  api_key: "237518157193281",
  api_secret: "ucWJnMRH_GBvQcP6RQDgUsAnDJ4",
  secure: true,
});
var app = express();
const cors = require("cors");

app.use(cors());

app.use(fileUpload());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(bodyParser.json()); // Pour gérer les données JSON
app.use(bodyParser.urlencoded({ extended: true })); // Pour gérer les données URL encodées

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
require("./config/database");
app.use("/", indexRouter);
app.use("/user", usersRouter);
app.use("/travel", travelRouter);
app.use("/diary", diaryRouter);

module.exports = app;
