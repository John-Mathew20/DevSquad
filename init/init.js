const mongoose = require("mongoose");
const initData = require("./data");
const User = require("../models/user.js");
const url = "mongodb://localhost:27017/DevSquad";

main()
  .then(() => {
    console.log(`Connected on ${url}`);
  })
  .catch((err) => {
    throw err;
  });

async function main() {
  await mongoose.connect(url);
}

const initDb = async () => {
  await User.insertMany(initData.data);
  console.log("data was initilasized");
};

initDb();
