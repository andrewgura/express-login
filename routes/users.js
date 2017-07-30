var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

//user model
var User = require('../models/user');

// Register page
router.get('/register', function(req, res) {
  res.render('register');
});

// Login page
router.get('/login', function(req, res) {
  res.render('login');
});

// Register User
router.post('/register', function(req, res) {
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

  // Validation to make sure passwords match
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();

  //Display any errors, otherwise create new user
  if (errors) {
    res.render('register', {
      errors: errors
    });
  } else {
    var newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password
    });
    //User created with success message and redirection to login page
    User.createUser(newUser, function(err, user) {
      if (err) throw err;
      console.log(user);
    });

    req.flash('success_msg', 'You are registered and can now login');

    res.redirect('/users/login');
  }
});

//if username doesnt exist, give error message
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.getUserByUsername(username, function(err, user) {
      if (err) throw err;
      if (!user) {
        return done(null, false, {
          message: 'Unknown User'
        });
      }
      //if password for attempted user doesnt match, give error message
      User.comparePassword(password, user.password, function(err, isMatch) {
        if (err) throw err;
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, {
            message: 'Invalid password'
          });
        }
      });
    });
  }));

// used to serialize the user for the session
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

//If correct username and password, login user and redirect to dashboard, otherwise flash error message
router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  }),
  function(req, res) {
    res.redirect('/');
  });

//Logout current signed in user, flash success message and redirect to login page
router.get('/logout', function(req, res) {
  req.logout();

  req.flash('success_msg', 'You are logged out');

  res.redirect('/users/login');
});

module.exports = router;
