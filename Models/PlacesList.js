var mongoose = require('mongoose');

var PlacesListSchema = mongoose.Schema({
    PlaceName: {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    SaleDescription: {
        type: String,
        required: true
    },
    SecretCode: {
        type: String,
        required: true
    },
    create_Date: {
        type: Date,
        default: Date.now
    }
});

var PlacesList = module.exports = mongoose.model('PlacesList', PlacesListSchema, 'PlacesList');

module.exports.GetPlacesList = function (callback, limit) {
    PlacesList.find(callback).limit(limit);
}

module.exports.GetPlaceById = function (id, callback) {
    PlacesList.findById(id, callback);
}

module.exports.AddPlace = function (place, callback) {
    PlacesList.create(place, callback);
}

module.exports.UpdatePlace = function (id, place, callback) {
    var query = { _id: id };
    var options = { new: true };
    var update = {
        PlaceName: place.PlaceName,
        Description: place.Description,
        image: place.image,
        SaleDescription: place.SaleDescription,
        SecretCode: place.SecretCode
    }
    PlacesList.findOneAndUpdate(query, update, options, callback);
}

module.exports.DeletePlace = function (id, callback) {
    var query = { _id: id };
    PlacesList.remove(query, callback);
}