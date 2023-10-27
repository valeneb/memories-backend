const mongoose = require("mongoose");

const flightSchema = new mongoose.Schema({
  airline: String,
  flightNumber: String,
  departureAirport: String,
  arrivalAirport: String,
  departureDate: Date,
  departureTime: Date,
  arrivalTime: Date,

  comments: String,
  price: Number,
});
const carSchema = new mongoose.Schema({
  carBrand: String,
  carModel: String,
  licensePlate: String,
  rentalCompany: String,
  rentalStart: Date,
  rentalEnd: Date,
  comments: String,
  price: Number,
});
const accomodationSchema = new mongoose.Schema({
  hotelName: String,
  address: String,
  checkInDate: Date,
  checkOutDate: Date,
  roomNumber: String,
  comments: String,
  price: Number,
});
const otherSchema = new mongoose.Schema({
  title: String,
  date: Date,
  hour: Date,
  comments: String,
  price: Number,
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
  // travelPlanning: {
  //   flights: [flightSchema],
  //   carRental: [carSchema],
  //   accomodations: [accomodationSchema],
  //   others: [otherSchema],
  // },
});

// travelSchema.index({ location: "2dsphere" });

const Travel = mongoose.model("travels", travelSchema);

module.exports = Travel;
