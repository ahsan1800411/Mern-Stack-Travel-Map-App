const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// register a user ==> post request=>/api/users/register
router.post("/register", async (req, res) => {
  // checks if the user exists in the database or not
  const emailExists = await User.findOne({ email: req.body.email });
  emailExists && res.status(400).json({ message: "Email already exists" });

  // hash the password
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  // create a new user
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashPassword,
  });
  try {
    const savedUser = await user.save();
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// login user==> post request =>/api/users/login
router.post("/login", async (req, res) => {
  try {
    // Find the user
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(400).send("Wrong Credentials");

    // now compare the password
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    !validPassword
      ? res.status(400).send("Password is not correct")
      : res.status(200).json({ user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
