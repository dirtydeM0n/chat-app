const express = require("express");
const router = express.Router();
const auth_middleware = require("../middleware/auth");
const User = require("../models/Users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Users = require("../models/Users");

// could've written a separate route and controller for each entity. Doing this to save time
// register a user

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Check if a user exists
    let user = await User.findOne({ email }).lean();
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" }); // So that our instance won't give any error messages
    }
    // Encrypting the password using bcrypt
    user = new User({
      name,
      email,
      password,
    });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // Returning a json web token for automatic login after registration
    // Expiration is totally optional
    // Mongoose abstraction allows us to use id instead of _id
    const payload = {
      user: {
        id: user.id,
      },
    };
    jwt.sign(
      payload,
      config.get("jwtSecret"),
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw { message: err };
        return res
          .status(200)
          .json({ success: true, message: "Registered successfully", token });
      }
    );
  } catch (err) {
    console.error(err.message);
    return res.status(400).send("Error while registering user");
  }
});

// login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if a user doesn't exist
    const user = await User.findOne(
      { email },
      { email: true, password: true }
    ).lean();
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Matching the passwords to authorize log-in
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      config.get("jwtSecret"),
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw { message: err };
        return res
          .status(200)
          .json({ success: true, message: "Logged in successfully", token });
      }
    );
  } catch (err) {
    console.error(err.message);
    return res.status(400).send("Error while registering user");
  }
});

// search user
router.post("/search", auth_middleware, async () => {
  try {
    const results = await Users.find(
      {
        name: { $regex: `^${req.body.search_query}$`, $options: "i" },
      },
      { name: true, email: true, id: true }
    ).lean();

    if (!results.length)
      return res
        .status(404)
        .json({ success: true, message: "User not found", data: [] });

    return res
      .status(200)
      .json({ success: true, message: "Search complete", data: results });
  } catch (error) {
    console.error(err.message);
    return res.status(400).send("Error while searching user");
  }
});
// start chat with said user
// start a group chat

module.exports = router;
