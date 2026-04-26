const express = require("express");
const app = express();
const path = require("path");
const ejsMate = require("ejs-mate");
const port = 8080;
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const session = require("express-session");
const User = require("./models/user");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.engine("ejs", ejsMate);
app.use(methodOverride("_method"));

// CRITICAL: Form data read karne ke liye
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessions (Login state yaad rakhne ke liye)
app.use(
  session({
    secret: "devsquad_hackathon_secret",
    resave: false,
    saveUninitialized: false,
  }),
);

// Navbar dynamic buttons ke liye
app.use((req, res, next) => {
  res.locals.currPath = req.path;
  next();
});

// Database Connection
mongoose
  .connect("mongodb://localhost:27017/DevSquad")
  .then(() => console.log("✅ Database Connected!"))
  .catch((err) => console.log("❌ DB Error:", err));

// ================= ROUTES =================

app.get("/", (req, res) => res.render("body/home.ejs"));
app.get("/login", (req, res) => res.render("body/login.ejs"));
app.get("/signup", (req, res) => res.render("body/signup.ejs"));

// 1. SIGNUP LOGIC
app.post("/signup", async (req, res) => {
  try {
    // Tumhare form ke input names: user[name], user[username], user[password], user[number]
    let { name, username, password, number } = req.body.user;

    const existingUser = await User.findOne({ username: username });
    if (existingUser) return res.send("Username already taken!");

    const newUser = new User({
      name: name,
      username: username,
      password: password,
      salary: Number(number), // number ko salary me save kar rahe hain
    });

    await newUser.save();
    req.session.userId = newUser._id; // Auto login
    res.redirect("/dash");
  } catch (err) {
    console.log(err);
    res.send("Signup Error");
  }
});

// 2. LOGIN LOGIC
app.post("/login", async (req, res) => {
  try {
    // Tumhare form ke input names: user[users], user[pass]
    let { users, pass } = req.body.user;

    const user = await User.findOne({ username: users });
    if (!user) return res.send("User not found!");

    if (pass === user.password) {
      req.session.userId = user._id;
      res.redirect("/dash");
    } else {
      res.send("Incorrect Password!");
    }
  } catch (err) {
    console.log(err);
    res.send("Login Error");
  }
});

// 3. DASHBOARD LOGIC (MATHS & CALCS)
app.get("/dash", async (req, res) => {
  try {
    if (!req.session.userId) return res.redirect("/login");

    const user = await User.findById(req.session.userId);
    if (!user) return res.send("User not found!");

    let salary = user.salary || 0;
    let food = user.expenses?.food || 0;
    let travel = user.expenses?.travel || 0;
    let taxes = user.expenses?.taxes || 0;
    let others = user.expenses?.others || 0;

    let totalExpenses = food + travel + taxes + others;
    let savings = salary - totalExpenses;
    let savingsPercentage =
      salary > 0 ? ((savings / salary) * 100).toFixed(1) : 0;

    res.render("body/dash.ejs", {
      user,
      salary,
      totalExpenses,
      savings,
      savingsPercentage,
      food,
      travel,
      taxes,
      others,
    });
  } catch (err) {
    console.log(err);
    res.send("Dashboard Error");
  }
});

// ==========================================
// UPDATE EXPENSES LOGIC (Edit feature)
// ==========================================
app.post("/update-expenses", async (req, res) => {
  try {
    if (!req.session.userId) return res.redirect("/login");

    // Form se saara data nikalenge
    let { salary, food, travel, taxes, others } = req.body;

    const user = await User.findById(req.session.userId);
    if (!user) return res.send("User not found!");

    // 🚀 THE EDIT MAGIC: Nayi values ko database me overwrite kar do
    user.salary = Number(salary) || 0;
    user.expenses.food = Number(food) || 0;
    user.expenses.travel = Number(travel) || 0;
    user.expenses.taxes = Number(taxes) || 0;
    user.expenses.others = Number(others) || 0;

    await user.save();

    // Save hone ke baad wapas Dashboard bhej do taaki updated Chart dikhe!
    res.redirect("/dash");
  } catch (err) {
    console.log(err);
    res.send("Error updating expenses");
  }
});

// ==========================================
// EXPENSES PAGE LOGIC
// ==========================================
app.get("/expenses", async (req, res) => {
  try {
    // Security: Check agar user login hai
    if (!req.session.userId) return res.redirect("/login");

    const user = await User.findById(req.session.userId);
    if (!user) return res.send("User not found!");

    // Data extract karo
    let salary = user.salary || 0;
    let food = user.expenses?.food || 0;
    let travel = user.expenses?.travel || 0;
    let taxes = user.expenses?.taxes || 0;
    let others = user.expenses?.others || 0;

    let totalExpenses = food + travel + taxes + others;

    // Expenses page render karo aur data bhej do
    res.render("body/expenses.ejs", {
      user,
      salary,
      totalExpenses,
      food,
      travel,
      taxes,
      others,
    });
  } catch (err) {
    console.log(err);
    res.send("Expenses Page Error");
  }
});

// 4. ADD EXPENSE LOGIC
app.post("/add-expense", async (req, res) => {
  try {
    if (!req.session.userId) return res.redirect("/login");

    let { category, amount } = req.body;
    amount = Number(amount);

    const user = await User.findById(req.session.userId);

    if (category === "food") user.expenses.food += amount;
    else if (category === "travel") user.expenses.travel += amount;
    else if (category === "taxes") user.expenses.taxes += amount;
    else if (category === "others") user.expenses.others += amount;

    await user.save();
    res.redirect("/dash");
  } catch (err) {
    console.log(err);
    res.send("Error adding expense");
  }
});

// ==========================================
// INSIGHTS & TIPS LOGIC
// ==========================================

// 1. Insights Page Render Karna
app.get("/insights", async (req, res) => {
  try {
    if (!req.session.userId) return res.redirect("/login");

    const user = await User.findById(req.session.userId);
    if (!user) return res.send("User not found!");

    res.render("body/insights.ejs", { user });
  } catch (err) {
    console.log(err);
    res.send("Insights Page Error");
  }
});

// 2. User ka custom note (insight) save karna
app.post("/add-insight", async (req, res) => {
  try {
    if (!req.session.userId) return res.redirect("/login");

    let { newInsight } = req.body;

    const user = await User.findById(req.session.userId);

    // 🛠️ THE FIX: Agar purana account hai aur array nahi hai, toh usko initialize karo
    if (!user.customInsights) {
      user.customInsights = [];
    }

    // Agar user ne kuch likha hai, toh usko safely push karke save kar do
    if (newInsight && newInsight.trim() !== "") {
      user.customInsights.push(newInsight);
      await user.save();
    }

    res.redirect("/insights");
  } catch (err) {
    console.log("Insight Error: ", err);
    res.send("Error adding insight");
  }
});

// ==========================================
// GOALS LOGIC
// ==========================================

// 1. Goals Page Render
app.get("/goals", async (req, res) => {
  try {
    if (!req.session.userId) return res.redirect("/login");
    const user = await User.findById(req.session.userId);
    if (!user) return res.send("User not found!");

    // Current savings calculate karo
    let salary = user.salary || 0;
    let totalExpenses =
      (user.expenses?.food || 0) +
      (user.expenses?.travel || 0) +
      (user.expenses?.taxes || 0) +
      (user.expenses?.others || 0);
    let currentSavings = salary - totalExpenses;

    res.render("body/goals.ejs", { user, currentSavings });
  } catch (err) {
    console.log(err);
    res.send("Goals Page Error");
  }
});

// 2. Naya Goal Set Karna
app.post("/set-goal", async (req, res) => {
  try {
    if (!req.session.userId) return res.redirect("/login");

    let { goalName, goalAmount } = req.body;

    const user = await User.findById(req.session.userId);
    user.goal = {
      name: goalName,
      amount: Number(goalAmount),
    };
    await user.save();

    res.redirect("/goals");
  } catch (err) {
    console.log(err);
    res.send("Error setting goal");
  }
});

// 5. LOGOUT LOGIC
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

app.listen(port, () => console.log(`🚀 App is running on port ${port}`));
