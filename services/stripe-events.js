'use strict';

var User = require('../models/User');

module.exports.fireEvent = function(event, done){
  if (event.type == 'customer.subscription.deleted' ) {
    var  CusId = event.data.object.customer.toString();
    User.findOne({'stripe.customerId': CusId}, (err, user) => {
      if (err) {
        console.log("Couldn't find subscription", CusId);
      } else if (user) {
        user.stripe.subscriptionId = '';
        user.stripe.plan = null;
        user.save( (err, user)=> {
          if (err) {
            done(err);
          } else {
            done(null, user);
          }
        });
      } else {
        console.log('unable to find user', CusId);
      }
    });

  }

};
