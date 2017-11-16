var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var mongoose = require('mongoose')
mongoose.Promise = require('bluebird')
var mongo = require('mongodb')
var expressValidator = require('express-validator')
var flash = require('connect-flash')
var session = require('express-session')
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy

mongoose.connect('mongodb://127.0.0.1:27017/parkfinder', { useMongoClient: true });

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(flash());

app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg   : msg,
            value : value
        };
    }
}));

app.use(function (req, res, next) {
    res.locals.user = req.user || null;
    next();
});

PlacesList = require('./Models/PlacesList');
User = require('./Models/User');

app.get('/PlacesList', function (req, res) {
    PlacesList.GetPlacesList(function (err, placesList) {
        if (err) {
            throw err;
        }
        res.json(placesList);
    });
})

app.get('/PlacesList/:_id', function (req, res) {
    PlacesList.GetPlaceById(req.params._id, function (err, placesList) {
        if (err) {
            throw err;
        }
        res.json(placesList);
    });
})

app.post('/PlacesList', function (req, res) {
    var place = req.body;
    PlacesList.AddPlace(place, function (err, place) {
        if (err) {
            throw err;
        }
        res.json(place);
    });
})

app.put('/PlacesList/:_id', function (req, res) {
    var id = req.params._id;
    var place = req.body;
    PlacesList.UpdatePlace(id, place, function (err, place) {
        if (err) {
            throw err;
        }
        res.json(place);
    });
})

app.delete('/PlacesList/:_id', function (req, res) {
    var id = req.params._id;
    PlacesList.DeletePlace(id, function (err, place) {
        if (err) {
            throw err;
        }
        res.json(place);
    });
})

// Register User
app.post('/register', function(req, res){
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var password2 = req.body.password2;

    // Validation
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if(errors){
        res.json(errors);
    } else {
        var newUser = new User({
            name: name,
            email:email,
            password: password
        });

        User.createUser(newUser, function(err, user){
            if(err) throw err;
            console.log(user);
            res.json(user);
        });
    }
});

passport.use(new LocalStrategy(
    { usernameField: "name", passwordField: "password" },
  function(name, password, done) {
      User.getUserByUsername(name, function(err, user){
          if(err) throw err;
          if(!user){
              return done(null, false, {message: 'Unknown User'});
          }

          User.comparePassword(password, user.password, function(err, isMatch){
              if(err) throw err;
              if(isMatch){
                  return done(null, user);
              } else {
                  return done(null, false, {message: 'Invalid password'});
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

app.post('/login',
  passport.authenticate('local'),
  function(req, res) {
      res.json("{response: success login}")
  });

app.get('/logout', function(req, res){
    req.logout();
    res.json("{response: success log out}");
});

app.listen(3000, function () {
    console.log('Server started on port 3000')
})
