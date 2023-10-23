require("dotenv").config();
// const session = require("express-session");
const passport = require("passport");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const tokenRoutes = require("./routes/token");
var app = express();
const cors = require("cors");
app.use(passport.initialize());
app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
require("./config/database");
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api", tokenRoutes);

module.exports = app;
