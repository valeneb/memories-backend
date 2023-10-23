const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const { MONGODB_URI } = process.env;

const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose.connect(MONGODB_URI, connectionOptions);

const db = mongoose.connection;
db.on("error", (error) => console.error("MongoDB connection error:", error));
db.once("open", () => console.log("Database connected to MongoDB"));
