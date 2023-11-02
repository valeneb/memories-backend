const mongoose = require("mongoose");

const flightSchema = new mongoose.Schema({
  airline: { default: "", type: String },
  flightNumber: {
    type: String,
    required: true,
    unique: true,
    sparse: true,
  },
  departureAirport: {
    default: "",
    type: String,
    sparse: true,
  },
  arrivalAirport: {
    default: "",
    type: String,
    sparse: true,
  },
  departureDate: {
    default: null,
    type: Date,
    sparse: true,
  },
  departureTime: {
    default: null,
    type: String,
    sparse: true,
  },
  arrivalTime: {
    default: null,
    type: String,
    sparse: true,
  },
  returnDate: {
    default: null,
    type: Date,
    sparse: true,
  },
  arrivalDate: {
    default: null,
    type: Date,
    sparse: true,
  },
  comments: {
    default: "",
    type: String,
    sparse: true,
  },
  price: {
    default: 0,
    type: Number,
    sparse: true,
  },
});
const carSchema = new mongoose.Schema({
  carBrand: {
    default: "",
    type: String,
    sparse: true,
  },
  carModel: {
    default: false,
    type: String,
  },
  licensePlate: {
    default: "",
    type: String,
  },
  rentalCompany: {
    default: "",
    type: String,
  },
  rentalStart: {
    default: null,
    type: Date,
  },
  rentalEnd: {
    default: null,
    type: Date,
  },
  comments: {
    default: "",
    type: String,
  },
  price: {
    default: 0,
    type: Number,
  },
});
const accommodationSchema = new mongoose.Schema({
  hotelName: {
    default: "",
    type: String,
  },
  address: {
    default: "",
    type: String,
  },
  checkInDate: {
    default: null,
    type: Date,
  },
  checkOutDate: {
    default: null,
    type: Date,
  },
  roomNumber: {
    default: "",
    type: String,
  },
  comments: {
    default: "",
    type: String,
  },
  price: {
    default: 0,
    type: Number,
  },
});
const otherSchema = new mongoose.Schema({
  title: {
    default: "",
    type: String,
  },
  date: {
    default: null,
    type: Date,
  },
  hour: {
    default: null,
    type: String,
  },
  comments: {
    default: "",
    type: String,
  },
  price: {
    default: 0,
    type: Number,
  },
});

const travelSchema = new mongoose.Schema({
  destination: String,
  departure: String,
  return: String,

  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number], //[latitude,longitude]
      required: true,
    },
  },
  coverImage: { type: mongoose.Schema.Types.Mixed, default: {} },
  travelDiary: [{ type: mongoose.Schema.Types.ObjectId, ref: "Diary" }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  travelPlanning: {
    flights: [flightSchema],
    carRentals: [carSchema],
    accommodations: [accommodationSchema],
    others: [otherSchema],
  },
});

// travelSchema.index({ location: "2dsphere" });

const Travel = mongoose.model("travels", travelSchema);

module.exports = Travel;
