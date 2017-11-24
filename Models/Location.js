var mongoose = require('mongoose');

var LocationSchema = mongoose.Schema({
    PlaceName: {
        type: String,
        required: true
    },
    Width: {
        type: String,
        required: true
    },
    Lenght: {
        type: String,
        required: true
    },
    create_Date: {
        type: Date,
        default: Date.now
    }
});

var Location = module.exports = mongoose.model('Location', LocationSchema, 'Location');

module.exports.GetLocations = function (callback, limit) {
    Location.find(callback).limit(limit);
}

module.exports.GetLocationById = function (id, callback) {
    Location.findById(id, callback);
}

module.exports.AddLocation = function (place, callback) {
    Location.create(place, callback);
}

module.exports.DeleteLocation = function (id, callback) {
    var query = { _id: id };
    Location.remove(query, callback);
}