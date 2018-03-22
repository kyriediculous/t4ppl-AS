const passport      = require('passport'),
      LocalStrategy = require('passport-local').Strategy,
      User          = require('../models/User.js'),
      open          = require('open');

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  function(req, username, password, done) {
    User.findOne( {email:username}, function(err, user) {
      if (err) {return done(err); }
      if (!user) {
        return done(null, false, {message: 'Ongeldig e-mailadres'} );
      }
      user.comparePassword(password, function(err, isMatch) {
      if (isMatch) {
        //return done(null, user);
        //CONFIRMED USER TEST
        if (user.confirmedUser) {
          return done(null, user)
        } else {
          return done(null, false, {message : 'Gelieve eerst uw e-mailadres te bevestigen'})
        }
      } else {
        return done(null, false, { message: 'Ongeldig wachtwoord.' });
      }
    });
    });
  }));


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});
