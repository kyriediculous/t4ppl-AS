const mongoose = require('mongoose'),
      bcrypt   = require('bcrypt-nodejs'),
      stripeCustomer = require('./plugins/stripe-customer.js'),
      Schema    = mongoose.Schema;

      stripeOptions = {
        apiKey: 'sk_test_8wnpQt7VLJCp8mf1JmPN1Dzp',  //Process.ev....
        stripePubKey: 'pk_test_NPnxAy3RQSO93ZvBE3GJZpO1', //process.env.STRIPE_PUBLIC_KEY
        defaultPlan: '',
        plans: ['monthly'],
        planData: {
          'monthly': {
            name : 'monthly',
            price: 10.00
          }
        }
      }

const userSchema = new Schema ({
  email:  {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String
  },
  company : {
    type: String
  },
  telephone : {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  confirmEmailToken: String,
  confirmedUser: Boolean
});

//Generating Hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.plugin(stripeCustomer, stripeOptions);

// create the model for users and expose it to our app
var User = module.exports = mongoose.model('User', userSchema);

module.exports.createUser = function(newUser, callback){
  newUser.password = bcrypt.hashSync(newUser.password, bcrypt.genSaltSync(8), null);
  newUser.save(callback);
}

module.exports.updatePassword = function(req, user, callback){
  user.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  user.save(callback);
}
/*	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	        newUser.save(callback);
	    });
	});*/

module.exports.getUserByEmail = function(email, callback){
	var query = {email: email};
	User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}
