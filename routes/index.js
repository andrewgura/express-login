var express = require('express');
var router = express.Router();

//user model
var User = require('../models/user');

//Get homepage
router.get('/', ensureAuthenticated, function(req, res) {
  //getting all blogposts from database
  User.find({}, function(err, currentUser) {
    if (err) {
      console.log(err)
    } else {
      //renders blogposts onto index.handlebars
      res.render('index', {
        currentUser: currentUser
      });
    }
  })
});

//Function to make sure user is logged in to be able to visit dashboard
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('error_msg', 'You are not logged in');
    res.redirect('/users/login');
  }
}

module.exports = router;
