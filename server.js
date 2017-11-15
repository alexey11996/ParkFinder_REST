var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var mongoose = require('mongoose')

app.use(bodyParser.json())

PlacesList = require('./Models/PlacesList');

mongoose.connect('mongodb://127.0.0.1:27017/parkfinder', { useMongoClient: true });

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

app.listen(3000, function () {
    console.log('Server started on port 3000')
})
