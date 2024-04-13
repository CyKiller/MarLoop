const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const passport = require('passport');
const router = express.Router();

router.get('/auth/register', (req, res) => {
  res.render('register');
});

router.post('/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    let user = await User.findOne({ username });
    if (user) {
      req.flash('error_msg', 'Username is already registered');
      return res.redirect('/auth/register');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      username,
      password: hashedPassword
    });
    await user.save();
    req.flash('success_msg', 'You are now registered and can log in');
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Registration error:', error);
    req.flash('error_msg', 'Error during registration');
    res.redirect('/auth/register');
  }
});

router.get('/auth/login', (req, res) => {
  res.render('login');
});

router.post('/auth/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/auth/login',
    failureFlash: true
  })(req, res, next);
});

router.get('/auth/logout', (req, res) => {
  req.logout(function(err) {
    if (err) {
      console.error('Error during logout:', err);
      res.status(500).send('Error logging out');
    }
    req.flash('success_msg', 'You are logged out');
    res.redirect('/auth/login');
  });
});

module.exports = router;