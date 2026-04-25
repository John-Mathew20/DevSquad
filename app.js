const express = require("express");
const app = express();
const path = require("path");
const ejsMate = require("ejs-mate");
const port = 8080;
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const url = "mongodb://localhost:27017/DevSquad";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/views")));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

main()
  .then(() => {
    console.log(`connected server on ${url}`);
  })
  .catch((err) => {
    throw err;
  });

async function main() {
  await mongoose.connect(url);
}

//home route
app.get("/", (req, res) => {
  res.render("body/home.ejs");
});

app.listen(port, () => {
  console.log(`app is running on ${port}`);
});
