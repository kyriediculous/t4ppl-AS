const passport       = require('passport');
const express        = require('express');
const crypto         = require('crypto');
const bcrypt   = require('bcrypt-nodejs');
const async          = require('async');
const flash          = require('connect-flash');
const sg             = require('sendgrid')(process.env.SG_API);
const helper         = require('sendgrid').mail;
const User           = require('../models/User');
const router         = express.Router();
const stripe        = require("stripe")("sk_test_8wnpQt7VLJCp8mf1JmPN1Dzp");
const endpointSecret = 'whsec_dH9PfHco65KHG1sTvUUQ5HWxj07tEoMq';
const stripeEvents = require('../services/stripe-events');
const bodyParser = require('body-parser');
const path = require('path');

//STRIPE webhook
router.post("/webhooks", (req, res) => {
  let sig = req.headers["stripe-signature"];
  let event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  stripeEvents.fireEvent(event, (err, user) => {
    if (user) {
      res.json({received: true});
      res.send(200);
    } else {
      res.send(200);
    }
  })
});

//STRIPE CREATE CHARGE
router.post('/subscription', function(req, res) {
  console.log(req.body);
    User.findOne({email:req.body.stripeEmail}, (err, user)=>{
      if (err) {
        req.flash('error', 'Er ging iets mis, probeer het later opnieuw');
      } else if (user.stripe.plan) {
        req.flash('info', 'U heeft al een abbonement');
        res.redirect('/auth/profile');
      } else if (user.stripe.customerId && !user.stripe.plan) {
        stripe.subscriptions.create({
          customer: user.stripe.customerId,
          items: [{plan:"1"}]
        }).then( (subscription) => {
          user.stripe.subscriptionId = subscription.id;
          user.stripe.plan = subscription.plan;
          user.save( (err, user) => {
            if (err) {
              req.flash('error', `${err}`);
              res.redirect('/');
            } else {
              req.flash('success', 'Bedankt, wij hebben uw betaling goed ontvangen. U kan nu gebruik maken van het Kennisplatform');
              res.redirect('/');
            }
          });
        }).catch( (err) => {
          req.flash('error', `${err}`);
          res.redirect('/');
        });
      } else if (user && !user.stripe.customerId) {
        stripe.customers.create({
          email: req.body.stripeEmail,
          source: req.body.stripeToken
        }).then( (customer) =>
          stripe.subscriptions.create({
            customer: customer.id,
            items: [{plan:'plan_DakA6bHBr3ll0T'}]
          })).then( (subscription) => {
          user.stripe = {
            customerId: subscription.customer,
            subscriptionId: subscription.id,
            plan: subscription.plan
          };
          user.save( (err, user) => {
            if (user) {
              req.flash('success', 'Bedankt, we hebben uw betaling goed ontvangen');
              res.redirect('/');
            } else console.log(err);
          });
        }).catch( (err) => {
          req.flash('error', `${err}`);
          res.redirect('/');
        });
      } else {
        req.flash('info', 'Gelieve eerst in te loggen of te registreren');
        res.redirect('/');
      }
    });
});

//CANCEL SUBSCRIPTION
router.get('/profile/subscription/cancel', (req, res) => {
  async.waterfall([
    (done) => {
      User.findById(req.user._id, (err, user) => {
        done(err, user);
      });
    },
    (user, done) => {
      if (!user.stripe.subscriptionId) {
        req.flash('error', 'U heeft geen bestaand abonnement');
        return res.redirect('/auth/profile');
      }
      stripe.subscriptions.del(user.stripe.subscriptionId, (err, confirmation) => {
        done(err, user, confirmation);
      });
    },
    (user, confirmation, done) => {
      if (confirmation) {
        user.stripe.plan = null;
        user.stripe.subscriptionId = null;
        user.save( (err, user) => {
          req.flash('success', 'Abonnement succesvol opgezegd');
          res.redirect('/auth/profile');
          done(err, 'done');
        });
      }
    }
  ], (err) => {
    if (err) {
      req.flash('error', 'Er ging iets mis, probeer het later opnieuw');
      return res.redirect('/auth/profile');
    }
  });
});

//AUTHENTICATION ROUTES
router.get('/login', function(req, res){
  res.render('auth/login', {
    messages: req.flash()
  });
});


router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) {
      req.flash('error', 'Ongeldig e-mail adres of wachtwoord.')
      return res.redirect('/');
   }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      var firstname = req.user.name.split(" ")[0]
      req.flash('success', 'Welkom terug, ' + firstname)
      return res.redirect('/');
    });
  })(req, res, next);
});

router.get('/signup', (req, res) => {
  res.render('auth/signup', {
    user: req.user,
    messages: req.flash()
  })
});

router.get('/remove-account', (req, res) => {
  if (req.user.stripe.customerId) {
    stripe.customers.del(req.user.stripe.customerId, (err, confirmation) => {
      if (err) {
        console.log(err);
        req.flash('error', 'Er ging iets mis, probeer het later opnieuw of neem contact op met de beheerder.')
        res.redirect('/auth/profile');
      }
    });
  }
  User.findOneAndRemove({_id: req.user._id}, (err, result) => {
    if (err) {
      console.log(err);
      req.flash('error', 'Er ging iets mis, probeer het later opnieuw of neem contact op met de beheerder.')
      res.redirect('/auth/profile');
    }
    console.log(result);
    req.flash('success', 'Je account is succesvol verwijderd. Mocht je je bedenken kan je altijd opnieuw registreren. Hopelijk tot weerziens!');
    res.redirect('/');
  });
});

router.post('/signup', (req, res) => {
  var name = req.body.name,
      email = req.body.email,
      password = req.body.password,
      telephone = req.body.telephone,
      company = req.body.company;

      var newUser = new User({
        name: name,
        email: email,
        password: password,
        telephone: telephone,
        company: company
      });

      User.createUser(newUser, (err, user) => {
        if (err) {
          req.flash('error', `User already exists`);
          res.redirect('/auth/signup');
        } else {
          req.flash('success', 'Bedankt! We hebben je een e-mail gestuurd om je e-mailadres te bevestigen');
          //Send confirmation Email
          async.waterfall([
            function(done) {
              crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                user.confirmEmailToken = token;
                user.save();
                done(err, token);
              });
            },
            function(token, done) {
              var to_email = new helper.Email(user.email);
              var from_email = new helper.Email('nico@altstreet.io');
              var subject = 'Email Bevestigen';
              var content = new helper.Content('text/plain', 'Bedankt om je te registreren op Technology4People.\n\n' +
                  'Gelieve op de volgende link te klikken om je email te bevestigen:\n\n' +
                  'http://' + req.headers.host + '/auth/signup/confirm/' + token + '\n\n' +
                  'Na het bevestigen van je e-mail adres krijgt u de mogelijkheid u te abonneren op het kennisplatform.');
              var mail = new helper.Mail(from_email, subject, to_email, content);

              var request = sg.emptyRequest({
                method: 'POST',
                path: '/v3/mail/send',
                body: mail.toJSON(),
              });

              sg.API(request, function(error, response) {

                done(error, 'done');
              });
            }],
            function(err){
              console.log(err);
              res.redirect('/auth/signup');
            });
        }
      });
});

router.get('/signup/confirm/:token', (req, res) => {
  User.findOne({confirmEmailToken: req.params.token}, (err, user) => {
    if (!user) {
      req.flash('error', 'Token is niet meer geldig.');
      return res.redirect('/auth/signup');
    }
    user.confirmedUser = true;
    user.confirmEmailToken = undefined;
    user.save( (err, user) => {
      if (err) {
        req.flash('error', `${err}`);
        console.log(err);
        res.redirect('/auth/signup');
      } else {
        req.flash('success', 'Je e-mail is bevestigd, je kan nu inloggen!');
        res.redirect('/auth/login');
      }
    })
  });
});

router.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });

router.get('/forgot', (req, res) => {
  res.render('auth/forgot', {
    user : req.user,
    messages: req.flash()
  });
});

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'Geen account met dit e-mailadres.');
          return res.redirect('/auth/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var to_email = new helper.Email(user.email);
      var from_email = new helper.Email('nico@altstreet.io');
      var subject = 'Wachtwoord Vergeten';
      var content = new helper.Content('text/plain', 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/auth/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n');
      var mail = new helper.Mail(from_email, subject, to_email, content);

      var request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON(),
      });

      sg.API(request, function(error, response) {
        req.flash('info', 'Er is een e⁻mail verzonden naar ' + user.email + ' met verdere instructies.');
        done(error, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/auth/forgot');
  });
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Tijd verstreken, vraag opnieuw een e-mail aan.');
      res.redirect('/auth/forgot');
    }
    res.render('auth/reset', {
      user: req.user
    });
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Tijd verstreken, vraag opnieuw een e-mail aan.');
          return res.redirect('back');
        }
        User.updatePassword(req, user, function(err) {
          req.logIn(user, function(err) {
            done(err, user);
          });
        });
      });
    },
    function(user, done) {
      var from_email = new helper.Email('nico@altstreet.io');
      var to_email = new helper.Email(user.email);
      var subject = 'Wachtwoord succesvol gewijzigd';
      var content = new helper.Content('text/plain', 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n');
      var mail = new helper.Mail(from_email, subject, to_email, content);

      var request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON(),
      });

      sg.API(request, function(err, response) {
        req.flash('success', 'Uw wachtwoord is succesvol gewijzigd');
        done(err, 'done');
      });
    }
  ], function(err) {
    res.redirect('/');
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
        return next();
  }
  else {
    req.flash('error', 'Om je profiel te bekijken moet je ingelogd zijn');
    res.redirect('/auth/login');
  }
}

router.get('/profile', ensureAuthenticated, (req, res) => {
  res.render('auth/profile.hbs', {
    messages: req.flash(),
    user: req.user
  })
});

router.post('/profile/updateUser', ensureAuthenticated, (req, res) => {
  User.findById(req.user._id , (err, user) => {
    if (err) {
      req.flash('error', "er ging iets mis");
      res.redirect('/auth/profile');
    } else {
      user.name = req.body.name;
      user.company = req.body.company;
      user.telephone = req.body.telephone;
      user.save( (err,user) => {
        if (err) return err;
        req.flash('success', 'Gegevens gewijzigd');
        res.redirect('/auth/profile');
      });

    }
  });
});

router.post('/profile/updateEmail', ensureAuthenticated, (req, res) => {
  User.findById(req.user._id, (err, user) => {
    if (err) {
      req.flash('error', "er ging iets mis");
      res.redirect('/auth/profile');
    } else {
      if (user.stripe.customerId) {
        async.waterfall([
          (done) => {
            user.email = req.body.email;
            user.save(done(err, user));
          },
          (user, done) => {
            stripe.customers.update(user.stripe.customerId, {email: req.body.email}, (err, customer) => {
              done(err, customer);
            });
          },
          (customer, done) => {
            req.flash('success', 'E-mailadres gewijzigd');
            res.redirect('/auth/profile');
            done(err, 'done');
          }
        ], (err) => {
          if (err) {
          req.flash('error', "er ging iets mis");
          res.redirect('/auth/profile'); }
        });
        //update both database and stripe customer
      } else {
        //no existing stripe customer update database only
        user.email = req.body.email;
        user.save( (err,user) => {
          if (err) {
            req.flash('error', "er ging iets mis");
             return res.redirect('/auth/profile');
          }
          req.flash('success', 'E-mailadres gewijzigd');
          res.redirect('/auth/profile');
        });
      }
    }
  });
});

router.post('/profile/changePassword', ensureAuthenticated, (req, res) => {
  async.waterfall([
    (done) => {
      User.findById(req.user._id, (err, user) => {
        done(err, user);
      });
    },
    (user, done) => {
      user.comparePassword(req.body.old, (err, isMatch) => {
        done(err, user, isMatch);
      });
    },
    (user, isMatch, done) => {
      if (!isMatch) {
        req.flash('error', 'Oud wachtwoord incorrect');
        return res.redirect("/auth/profile")
      } else if (isMatch && !req.body.new === req.body.new2) {
        req.flash('error', 'Nieuwe wachtwoorden moeten dezelfde zijn');
        return res.redirect('/auth/profile');
      } else if (isMatch && req.body.new === req.body.new2) {
        var newpassword = bcrypt.hashSync(req.body.new, bcrypt.genSaltSync(8), null);
        user.password = newpassword;
        user.save( (err, user) => {
          done(err, user);
        });
      }
    },
    (user, done) => {
      var from_email = new helper.Email('nico@altstreet.io');
      var to_email = new helper.Email(user.email);
      var subject = 'Wachtwoord succesvol gewijzigd';
      var content = new helper.Content('text/plain', 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n');
      var mail = new helper.Mail(from_email, subject, to_email, content);

      var request = sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON(),
      });

      sg.API(request, function(err, response) {
        req.flash('success', 'Uw wachtwoord is succesvol gewijzigd');
        res.redirect('/auth/profile');
        done(err, 'done');
      });
    }
  ], (err) => {
    if (err) {
    req.flash('error', 'Er ging iets mis, probeer het later opnieuw of contacteer ons via info@technology4people.be');
    res.redirect('/auth/profile');}
  })
});
module.exports = router;
