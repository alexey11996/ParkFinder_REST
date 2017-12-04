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

mongoose.connect('mongodb://alex:123@ds157500.mlab.com:57500/parkfinder', { useMongoClient: true });

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
    var UName = res.locals.user_name = req.body.name || null;
    next();
});

PlacesList = require('./Models/PlacesList');
User = require('./Models/User');
Location = require('./Models/Location');

app.get('/Location', function (req, res) {
    Location.GetLocations(function (err, location) {
        if (err) {
            throw err;
        }
        res.json(location);
    });
})

app.get('/Location/:_id', function (req, res) {
    Location.GetLocationById(req.params._id, function (err, location) {
        if (err) {
            throw err;
        }
        res.json(location);
    });
})

app.post('/Location', function (req, res) {
    var place = req.body;
    Location.AddLocation(place, function (err, location) {
        if (err) {
            throw err;
        }
        res.json(location);
    });
})

app.delete('/Location/:_id', function (req, res) {
    var id = req.params._id;
    Location.DeleteLocation(id, function (err, location) {
        if (err) {
            throw err;
        }
        res.json(location);
    });
})

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

app.put('/addToFavourite/:_name', function (req, res) {
    var pname = req.params._name;
    var username = res.locals.user_name;
    User.AddToFavourite(pname, username, function (err, response) {
        if (err) {
            throw err;
        }
        res.json(response);
    });
})

app.get('/getFavourites/:_username', function (req, res) {
    var username = req.params._username;
    var array_name = null;
    User.GetFavouritePlaces(username, function (err, response) {
        array_name = response.favourites;
        PlacesList.GetFavorPlacesByNames(array_name, function (err, fav_places) {
            console.log(array_name);
            res.json(fav_places);
        });
    });
})

app.put('/deleteFromFavourite/:_name', function (req, res) {
    var pname = req.params._name
    var username = res.locals.user_name;
    User.DeleteFromFavourite(pname, username, function (err, response) {
        if (err) {
            throw err;
        }
        res.json(response);
    });
})

app.put('/addToFavouriteLocation/:_id', function (req, res) {
    var id = req.params._id;
    var username = res.locals.user_name;
    User.AddToFavouriteLocation(id, username, function (err, response) {
        if (err) {
            throw err;
        }
        res.json(response);
    });
})

app.put('/deleteFromFavouriteLocation/:_id', function (req, res) {
    var id = req.params._id;
    var username = res.locals.user_name;
    User.DeleteFromFavouriteLocation(id, username, function (err, response) {
        if (err) {
            throw err;
        }
        res.json(response);
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
          if (err) throw err;
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
      User.getUserByUsername(res.locals.user_name, function (err, user) {
          res.json(user);
      });
  });

app.get('/logout', function(req, res){
    req.logout();
    res.SendStatus(200);
});

//app.listen(8000, function () {
//    console.log('Server started on port 8000')
//})

app.listen(process.env.PORT || 3000, function () {
    console.log("Server listening on port %d in %s mode", this.address().port, app.settings.env);
});
