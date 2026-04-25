const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unqiue: true, lowercase: true },
  password: { type: String, required: true },
  salary: { type: Number, default: 0, required: true },
  rent: { type: Number, default: 0 },
  taxes: { type: Number, default: 0 },
  food: { type: Number, default: 0 },
  travel: { type: Number, default: 0 },
  medical: { type: Number, default: 0 },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
