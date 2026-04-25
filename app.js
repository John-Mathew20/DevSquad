const express = require("express");
const app = express();
const path = require("path");
const ejsMate = require("ejs-mate");
const port = 8080;
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
const url = "mongodb://localhost:27017/DevSquad";
const wrapAsync = require("./utils/wrapAsync");
const User = require("./models/user");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/views")));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

app.use((req, res, next) => {
  res.locals.currPath = req.path;
  next();
});
//start
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

//login route
app.get("/login", async (req, res) => {
  res.render("body/login.ejs");
});

app.post("/login", async (req, res) => {
  let { username, password } = req.body;
  const user = await User.findOne({ username: username });
  if (username == User.username && password == User.password) {
    res.redirect(`/dash`);
  } else {
    res.send("Invalid username or password");
  }
});

//dash
app.get("/dash", async (req, res) => {
  res.render("body/dash.ejs");
});

//signup
app.get("/signup", async (req, res) => {
  res.render("body/signup.ejs");
});

app.all("/*splat", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Gone Wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(port, () => {
  console.log(`app is running on ${port}`);
});
