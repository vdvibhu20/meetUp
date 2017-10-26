var express = require('express');
var router = express.Router();
var googleMapsClient= require('../public/lib/googleMapsClient/googleMapsClient').getGoogleMapsClient();
var mongo= require('../public/lib/mongo/mongoQuery');


mongo.createCollection('meetup', function(result){
    // console.log('mongo-createCollection-indexjs');
    // console.log(result);
});


router.get('/', function(req, res){
    res.sendfile('./public/templates/index.html');
});


router.get('/getLatLong', function(req, res){
    // console.log('getlatlong');
    // req= req.body;
    // console.log(req.params);
    googleMapsClient.geocode({address: req.param('address')}, function(result, status){
        if(status.json.status== 'OK'){
            // console.log('geocode');
            // console.log(result);
            res.json({success: true, result: status.json.results});
        }else{
            res.json({success: false, result: status})
        }
    });
});

router.post('/create_meet', function(req, res){
    req= req.body;
    // console.log(req);
    mongo.createMeet(req, function onComplete(result){
        // console.log('index; result');
        // console.log(result);
        res.json({result: result});
    })
});


router.get('/get_members', function(req, res){
    // console.log('getmembers');
    // req= req.body;
    // console.log(req);

    mongo.getMembers(req, function(result){
        // console.log(result);
        if(result.success){
            res.json({success: true, result: result.data});
        }else{
            res.json({success: false, result: result.err});
        }
    })
});

router.post('/join_meet', function (req, res) {
   // console.log('join meet');
   req= req.body;
   mongo.insertMember(req, function (result) {
       // console.log(result);
       if(result.success){
           res.json({success: true, result: result.result});
       }else{
           res.json({success: false, result: result.err});
       }
   })
});

router.get('/get_nearby_places', function (req, res) {
    // console.log(JSON.parse(req.param('location')));
    var location= JSON.parse(req.param('location'));
    var radius= JSON.parse(req.param('radius'));
    var data= {
        location: location,
        radius: radius,
        type: 'restaurant'
    }
    // console.log(data);

    googleMapsClient.placesNearby(data, function (result, status) {
        if(status.json.status=='OK'){
            res.json({success: true, result: status.json.results});
            // console.log(status);
        }else{
            res.json({success: false, result: status})
            // console.log(status);
        }
    })
})


// mongo.insert(data, function(result){
//     console.log('mongo-insert-indexjs');
//     console.log(result);
// });
// mongo.insertMember(data, function(result){
//     console.log('mongo-insert-member-indexjs');
//     console.log(result.opts);
// });




module.exports = router;
