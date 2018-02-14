const User = require('mongoose').model('User');
const passport = require('passport');

const getErrorMessage = function getErrorMessage(err) {
  var message = '';

  if (err.code) {
    switch(err.code) {
      case 11000:
      case 11001:
        message = 'Username already exists';
        break;
      default:
        message = 'Something went wrong';
    }
  } else {
    for (var errName in err.errors) {
      if (err.errors[errName].message) {
        message = err.errors[errName].message;
      }
    }
  }

  return message;
};

exports.signin = function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err || !user) {
      res.status(400).send(info);
    } else {
      // Remove sensative data before login
      user.password = undefined;
      user.salt = undefined;

      req.login(user, function(err) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.json(user);
        }
      });
    }
  })(req, res, next);
};

exports.signup = function(req, res) {
  const user = new User(req.body);
  user.provider = 'local';
  user.save((err) => {
    if (err) {
      return res.status(400).send({
        message: getErrorMessage(err)
      });
    } else {
      // Remove sensative data before login
      user.password = undefined;
      user.salt = undefined;

      req.login(user, function(err) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.json(user);
        }
      });
    }
  });
};

exports.signout = function(req, res) {
  req.logout()
  res.redirect('/');
};

exports.saveOAuthUserProfile = function(req, profile, done) {
  User.findOne({
    provider: profile.provider,
    providerId: profile.providerId
  }, function(err, user) {
    if (err) {
      return done(err);
    } else {
      if (!user) {
        const possibleUsername = profile.username || ((profile.email) ? profile.email.split('@')[0] : '');
        User.findUniqueUsername(possibleUsername, null, function(avaliableUsername) {
          profile.username = avaliableUsername;
          user = new User(profile);
          user.save((err) => {
            if (err) {
              const message = _this.getErrorMessage(err);
              req.flash('error', message);
              return res.redirect('/signup');
            }
            return done(err, user);
          });
        });
      } else {
        return done(err, user);
      }
    }
  });
};
