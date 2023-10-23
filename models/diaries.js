const mongoose = require("mongoose");

const diarySchema = mongoose.Schema({
  title: String,
  description: String,
  pictures: [{ type: mongoose.Schema.Types.Mixed, default: {} }],
  travel: { type: mongoose.Schema.Types.ObjectId, ref: "travels" },
});
const Diary = mongoose.model("diaries", diarySchema);
module.exports = Diary;
