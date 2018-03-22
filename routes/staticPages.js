const express        = require('express');
const router         = express.Router();
const client         = require('../services/contentfulClient').client;
const sg             = require('sendgrid')('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');
const helper         = require('sendgrid').mail;

var marked = require('marked');
marked.setOptions({
  renderer: new marked.Renderer(),
  sanitize: true,
  smartLists: true,
  smartypants: true
});

//Home
router.get('/', (req, res) => {
  client.getEntry('70Yt2pr4nC8iOuScASIks8')
  .then( (entry)=> {
    entry.fields.body = marked(entry.fields.body);
    if (entry.fields.additional) {
        entry.fields.additional = marked(entry.fields.additional);
    } else {
      entry.fields.additional="";
    }
    res.render('static/index',
     {
       entry: entry,
       user: req.user,
       messages: req.flash()
     });
  }).catch( (err) => {
    console.log(err);
  })
});

//Diensten
router.get('/diensten', (req, res) => {
  client.getEntry('1OpQfoYuioqgCwqqmC2wGU')
  .then( (entry)=> {
    entry.fields.body = marked(entry.fields.body);
    if (entry.fields.additional) {
        entry.fields.additional = marked(entry.fields.additional);
    } else {
      entry.fields.additional="";
    }
    res.render('static/services', {
      entry: entry,
      user: req.user
    });
  }).catch( (err) => {
    console.log(err);
  })
});

router.post('/diensten', (req, res) => {
  var to_email = new helper.Email("nico@altstreet.io");
  var from_email = new helper.Email(req.body.email);
  var subject = 'Technology For People Contactformulier';
  var content = new helper.Content('text/plain', `Bericht van : ${req.body.name} ${req.body.email} \n\n
    Bedrijf : ${req.body.company} - Ondernemingsnummer: ${req.body.VATnumber} \n\n
    Gemeente : ${req.body.city} ( ${req.body.zipcode} ) \n\n
    Soort Dienst : ${req.body.servicetype}
    Bericht: \n\n
    ${req.body.comment} \n\n
    Gelieve mij hierover te contacteren op ${req.body.telephone}`);
  var mail = new helper.Mail(from_email, subject, to_email, content);

  var request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON(),
  });

  sg.API(request, function(err, response) {
    if (err) {
      req.flash('error', 'er ging iets mis, probeer het later opnieuw');
      return res.redirect('/diensten/#dienstenForm');
    } else {
      req.flash('success', 'Uw vraag is verstuurd. We antwoorden zo snel mogelijk');
      return res.redirect('/diensten/#dienstenForm');
    }
  });
});


//Gratis Tools
router.get('/tools', (req, res) => {
  client.getEntry('6gNZs3cT9COSMaSCYw8oYe')
  .then( (entry)=> {
    entry.fields.body = marked(entry.fields.body);
    if (entry.fields.additional) {
        entry.fields.additional = marked(entry.fields.additional);
    } else {
      entry.fields.additional="";
    }
    res.render('static/tools', {
      entry: entry,
      user: req.user
    });
  }).catch( (err) => {
    console.log(err);
  })
});

//Contact
router.get('/contact', (req, res) => {
  client.getEntry('3se6fuqjDWaOwKOWuGGE48')
  .then( (entry)=> {
    entry.fields.body = marked(entry.fields.body);
    if (entry.fields.additional) {
        entry.fields.additional = marked(entry.fields.additional);
    } else {
      entry.fields.additional="";
    }
    res.render('static/contact', {
      entry: entry,
      user: req.user,
      messages:req.flash()
    });
  }).catch( (err) => {
    console.log(err);
  })
});

router.post('/contact', (req, res) => {
  var to_email = new helper.Email("nico@altstreet.io");
  var from_email = new helper.Email(req.body.email);
  var subject = 'Technology For People Contactformulier';
  var content = new helper.Content('text/plain', `Bericht van : ${req.body.name} <${req.body.email}> \n\n
    Bedrijf : ${req.body.company} \n\n
    Bericht: \n\n
    ${req.body.comment}`);
  var mail = new helper.Mail(from_email, subject, to_email, content);

  var request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON(),
  });

  sg.API(request, function(err, response) {
    if (err) {
      req.flash('error', 'er ging iets mis, probeer het later opnieuw');
      return res.redirect('/contact');
    } else {
      req.flash('success', 'Uw bericht is verstuurd. We antwoorden zo snel mogelijk');
      return res.redirect('/contact');
    }
  });
});

//Over Mij
router.get('/about', (req, res) => {
  client.getEntry('4YdElr5WbmwmcE6EuQIaWS')
  .then( (entry)=> {
    entry.fields.body = marked(entry.fields.body);
    if (entry.fields.additional) {
        entry.fields.additional = marked(entry.fields.additional);
    } else {
      entry.fields.additional="";
    }
    res.render('static/about', {
      entry: entry,
      user: req.user
    });
  }).catch( (err) => {
    console.log(err);
  })
});

//Algemene Voorwaarden
router.get('/terms', (req, res) => {
  client.getEntry('3tl5se05NSkCGMICyGAQuk')
  .then( (entry)=> {
    entry.fields.body = marked(entry.fields.body);
    if (entry.fields.additional) {
        entry.fields.additional = marked(entry.fields.additional);
    } else {
      entry.fields.additional="";
    }
    res.render('static/terms', {
      entry: entry,
      user: req.user
    });
  }).catch( (err) => {
    console.log(err);
  })
});

//Privacy
router.get('/privacy', (req, res) => {
  client.getEntry('5Az1XUec0gGowkgUemMAY0')
  .then( (entry)=> {
    entry.fields.body = marked(entry.fields.body);
    if (entry.fields.additional) {
        entry.fields.additional = marked(entry.fields.additional);
    } else {
      entry.fields.additional="";
    }
    res.render('static/privacy', {
      entry: entry,
      user: req.user
    });
  }).catch( (err) => {
    console.log(err);
  })
});



module.exports = router;
