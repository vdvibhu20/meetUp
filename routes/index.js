var express = require('express');
var router = express.Router();
var googleMapsClient= require('../public/lib/googleMapsClient/googleMapsClient').getGoogleMapsClient();
var mongo= require('../public/lib/mongo/mongoQuery');

// console.log(googleMapsClient.placesAutoComplete({
//     input:'Ras Vihar Appartments',
//     types: 'geocode'
// }, function (err, result) {
//     console.log(result);
// }));
/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });
// mongo.createCollection('meetup', function(result){
//     console.log('mongo-createCollection-indexjs');
//     // console.log(result);
// });


router.get('/', function(req, res){
    res.sendfile('./public/templates/index.html');
});

// googleMapsClient.geocode({'address': 'Ras Vihar Appartment'}, function(result,status){
//     console.log(status.json.status);
//     console.log(result);
//
//
// });

router.get('/getLatLong', function(req, res){
    console.log('getlatlong');
    // req= req.body;
    console.log(req.params);
    googleMapsClient.geocode({address: req.param('address')}, function(result, status){
        if(status.json.status== 'OK'){
            console.log('geocode');
            console.log(result);
            res.json({success: true, result: status.json.results});
        }else{
            res.json({success: false, result: status})
        }
    });
});

router.post('/create_meet', function(req, res){
    req= req.body;
    console.log(req);
    mongo.createMeet(req, function onComplete(result){
        console.log('index; result');
        // console.log(result);
        res.json({result: result});
    })
});


router.get('/get_members', function(req, res){
    console.log('getmembers');
    // req= req.body;
    // console.log(req);

    mongo.getMembers(req, function(result){
        console.log(result);
        if(result.success){
            res.json({success: true, result: result.data});
        }else{
            res.json({success: false, result: result.err});
        }
    })
});

router.post('/join_meet', function (req, res) {
   console.log('join meet');
   req= req.body;
   mongo.insertMember(req, function (result) {
       console.log(result);
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
    console.log(data);

    googleMapsClient.placesNearby(data, function (result, status) {
        if(status.json.status=='OK'){
            res.json({success: true, result: status.json.results});
        }else{
            res.json({success: false, result: status})
        }
    })
})
// var data={
//     name: 'party2',
//     host: 'blair williams',
//     members: []
// }
//
// data= {
//     match:{
//         name: 'party'
//     },
//     value:{
//         name: 'harry potter',
//         location: {lat: 28.012, long: 77.72}
//     }
// }

// mongo.insert(data, function(result){
//     console.log('mongo-insert-indexjs');
//     console.log(result);
// });
// mongo.insertMember(data, function(result){
//     console.log('mongo-insert-member-indexjs');
//     console.log(result.opts);
// });




module.exports = router;
