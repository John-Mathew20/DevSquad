const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  salary: { type: Number, default: 0 },
  expenses: {
    food: { type: Number, default: 0 },
    travel: { type: Number, default: 0 },
    taxes: { type: Number, default: 0 },
    others: { type: Number, default: 0 },
  },
  customInsights: [{ type: String }],
  goal: {
    name: { type: String, default: "" }, // Jaise: "Sports Bike", "Jewelry"
    amount: { type: Number, default: 0 }, // Jaise: 150000
  },
});

module.exports = mongoose.model("User", userSchema);
