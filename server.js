const port          =  process.env.PORT || '3000',
      mongodbURI    =  process.env.MONGODB_URI || 'mongodb://heroku_r812m4xx:l206jc0002esdp2oaup0igdvqp@ds155352.mlab.com:55352/heroku_r812m4xx';

const express       = require('express'),
      mongoose      = require('mongoose'),
      cookieParser  = require('cookie-parser'),
      bodyParser    = require('body-parser'),
      passport      = require('passport'),
      flash         = require('connect-flash'),
      path          = require('path'),
      session       = require('express-session'),
      favicon       = require('serve-favicon'),
      helmet        = require('helmet'),
      compression   = require('compression'),
      cors          = require('cors'),
      stripe        = require("stripe")("sk_test_8wnpQt7VLJCp8mf1JmPN1Dzp"),
      hbs           = require('hbs'),
      paginate      = require('handlebars-paginate');

require('./services/passport.js'),

mongoose.connect(mongodbURI);

const app = express();
app.set('views', path.join(__dirname, 'views'));
hbs.registerPartials(__dirname + '/views/partials');
app.set('view engine', 'hbs');
app.set('view options', { layout: 'layout/default2' });

/*handelbars helpers */
hbs.registerHelper('blogTease', (object) => {
  return object.slice(0, 255);
});
hbs.registerHelper('dateFormat', (timestamp) => {
  time = new Date(timestamp);
  return time.toLocaleDateString('en-GB');
});
hbs.registerHelper('stringify', obj => JSON.stringify(obj, null, 2))
hbs.registerHelper('paginate', paginate);

app.set('view cache', true);
app.use(helmet()); // protect from well known vulnerabilities
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.raw({type: "*/*"}));
app.use(cookieParser());
app.use(cors());

app.use(compression());
// required for passport
app.use(session({ cookie: { path: '/', httpOnly: true, maxAge: null},
                  secret: 'ilovescotchscotchyscotchscotch',
                })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use('/kennisplatform', ensureAuthenticatedForWiki);
app.use('/kennisplatform', express.static(path.join(__dirname, 'kennisplatform')));
function ensureAuthenticatedForWiki(req, res, next) {
  if (req.isAuthenticated()) {
        return next();
  }
  else {
    req.flash('error', 'Om het kennisplatform te bekijken moet je ingelogd zijn');
    res.redirect('/auth/login');
  }
}
app.use('/testversie', express.static(path.join(__dirname, 'testversie')))

/* _________________________________
          ROUTES GO HERE
  ________________________________ */
app.use('/auth', require('./routes/authRoutes'));
app.use('', require('./routes/staticPages'));
app.use('/blog', require('./routes/blogRoutes'));
app.listen(port, function(err){
  console.log("server started");
});
