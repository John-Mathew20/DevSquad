const user = require("../models/user");

async function handleUserSignUp(req, res) {
  const { name, email, password } = req.body;
  await user.create({
    name,
    username,
    email,
    password,
  });
  return res.render("home");
}

async function handleUserLogin(req, res) {
  const { username, password } = req.body;
  const user = await user.findOne({
    username,
    password,
  });
  return res.render("home");
}

module.exports = { handleUserSignUp };
