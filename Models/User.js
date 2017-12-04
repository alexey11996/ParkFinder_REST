var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// User Schema
var UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    favourites: {
        type: Array
    },
    locations: {
        type: Array
    }
});

var User = module.exports = mongoose.model('User', UserSchema, 'User');

module.exports.createUser = function (newUser, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newUser.password, salt, function (err, hash) {
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}

module.exports.getUserByUsername = function (name, callback) {
    var query = { name: name };
    User.findOne(query, callback);
}

module.exports.getUserById = function (id, callback) {
    User.findById(id, callback);
}

module.exports.comparePassword = function (candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
        if (err) throw err;
        callback(null, isMatch);
    });
}

//PlacesList Favourite
module.exports.AddToFavourite = function (Placen, UserName, callback) {
    User.findOneAndUpdate({ 'name': UserName }, { $push: { favourites: Placen } }, {new : true}, callback);
}

module.exports.DeleteFromFavourite = function (Placen, UserName, callback) {
    User.findOneAndUpdate({ 'name': UserName }, { $pull: { favourites: Placen } }, { new: true }, callback);
}

module.exports.GetFavouritePlaces = function (username, callback) {
    User.findOne({ 'name': username }, { favourites: 1 , _id: 0}, callback);
}

//Location Favourite
module.exports.AddToFavouriteLocation = function (location_id, UserName, callback) {
    User.findOneAndUpdate({ 'name': UserName }, { $push: { locations: location_id } }, { new: true }, callback);
}

module.exports.DeleteFromFavouriteLocation = function (location_id, UserName, callback) {
    User.findOneAndUpdate({ 'name': UserName }, { $pull: { locations: location_id } }, { new: true }, callback);
}

