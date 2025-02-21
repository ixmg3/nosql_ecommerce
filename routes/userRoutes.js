const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

// redner login
router.get('/login', (req, res) => {
  res.render('login');
});

// render registration
router.get('/register', (req, res) => {
  res.render('register');
});

// register functionality
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirm_password, role, address } = req.body;
    
    // passwords match
    if (password !== confirm_password) {
      return res.send(`<script>alert("Passwords do not match"); window.location.href="/users/register";</script>`);
    }

    // duplicate check
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send(`<script>alert("User already exists with that email"); window.location.href="/users/register";</script>`);
    }

    const newUser = new User({
      name,
      email,
      password,
      role: role || 'user', // its always user cuz you cant make yourself admin
      address
    });

    await newUser.save();

    return res.send(`<script>alert("User registered successfully!"); window.location.href="/users/login";</script>`);
  } catch (error) {
    return res.send(`<script>alert("Error: ${error.message}"); window.location.href="/users/register";</script>`);
  }
});



// login functionality
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // search by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.send(`<script>alert("User not found"); window.location.href="/users/login";</script>`);
    }
    
    // match passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.send(`<script>alert("Invalid credentials"); window.location.href="/users/login";</script>`);
    }
    
    // store session info
    req.session.user = { id: user._id, role: user.role, name: user.name };

    return res.send(`<script>alert("Logged in successfully!"); window.location.href="/";</script>`);
  } catch (error) {
    return res.send(`<script>alert("Error: ${error.message}"); window.location.href="/users/login";</script>`);
  }
});

// logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/users/login');
});

module.exports = router;
