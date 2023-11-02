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
var usersRouter = require("./routes/user");

var planningRouter = require("./routes/plannings/allPictures");
const travelRouter = require("./routes/travel");
const diaryRouter = require("./routes/diary");
const flightRouter = require("./routes/plannings/flights");
const carRouter = require("./routes/plannings/cars");
const accomodationRouter = require("./routes/plannings/accomodations");
const otherRouter = require("./routes/plannings/others");
// const authRoute = require("./routes/auth");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
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

app.use(bodyParser.json()); // Pour gérer les données JSON
app.use(bodyParser.urlencoded({ extended: true })); // Pour gérer les données URL encodées

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
require("./config/database");
app.use("/", planningRouter);
app.use("/user", usersRouter);
app.use("/travel", travelRouter);
app.use("/diary", diaryRouter);
app.use("/flight", flightRouter);
app.use("/car", carRouter);
app.use("/accomodation", accomodationRouter);
app.use("/other", otherRouter);

module.exports = app;
