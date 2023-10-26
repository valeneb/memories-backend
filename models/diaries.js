const mongoose = require("mongoose");

const diarySchema = mongoose.Schema({
  title: String,
  description: String,
  moment: { type: mongoose.Schema.Types.Mixed, default: {} },
  moment_pictures: Array,
  travel: { type: mongoose.Schema.Types.ObjectId, ref: "travel" },
});
const Diary = mongoose.model("diaries", diarySchema);
module.exports = Diary;
