const mongoose = require("mongoose");
// 1. Data wali file ko import karo
const initData = require("./data.js");
// 2. Apne User model ko import karo (dhyaan rakhna path sahi ho)
const User = require("../models/user.js");

const url = "mongodb://localhost:27017/DevSquad";

// Database se connect karo
mongoose
  .connect(url)
  .then(() => console.log("Connected to DB for initialization"))
  .catch((err) => console.log(err));

const initDB = async () => {
  try {
    // Purana data clear karo (optional but recommended for clean start)
    await User.deleteMany({});

    // Naya demo data insert karo
    // initData.data likhna zaroori hai kyunki tumne export me { data: sampleUser } likha tha
    await User.insertMany(initData.data);

    console.log("Data was successfully initialized in MongoDB!");

    // Kaam hone ke baad connection close kar do
    mongoose.connection.close();
  } catch (err) {
    console.log("Error initializing data: ", err);
  }
};

// Function ko chalao
initDB();
