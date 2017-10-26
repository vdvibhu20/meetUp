var MongoClient= require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/temp";
var objectId= require('mongodb').ObjectID;

var meetup={
    name: '',
    host: '',
    loacation: '',
    members: []
}

function createCollection(req, callback) {
    console.log('createcollection');
    MongoClient.connect(url, function (err, db) {
        if(err){
            console.log(err);
            callback({success: false, err: err});
        }else{
            // console.log('hello');

            // console.log('success');

            db.createCollection('meetup', function(err, response){
                if(err){
                    callback({success: false, err: err});
                }else{
                    callback({success: true, result: response});
                }
            })
        }
    })
}


function createMeet(req, callback){
    // console.log('createMeet');
    // console.log(req);
    MongoClient.connect(url, function (err, db) {
        if(err){
            console.log(err);
            callback({success: false, err: err})
        }else{
            db.collection('meetup').insertOne(req, function(err, result){
                if(err){
                    callback({success: false, err: err});
                }else{
                    // console.log(result.ops);
                    callback({success: true, result: result.ops});
                }
            })
        }
    })
}

function insertMember(req, callback){
    MongoClient.connect(url, function (err, db) {
        if(err){
            callback({success: false, err: err})
        }else{
            // console.log(req);
            db.collection('meetup').updateOne({_id: new objectId(req.match)}, {$push: {members: req.value}}, function(err, result){
                if(err){
                    callback({success: false, err: err});
                }else{
                    callback({success: true, result: result});
                }
            })
        }
    })
}
function getMembers(req, callback){
    // console.log(req);
    MongoClient.connect(url, function (err, db) {
        if(err){
            callback({success: false, err: err})
        }else{
            db.collection('meetup').find({_id: new objectId(req.param('id'))}).toArray(function(err, result){
                if(err){
                    callback({success: false, err: err});
                }else{
                    // console.log('getmember result');
                    // console.log(result);
                    callback({success: true, data: result});
                }
            })
        }
    })
}

module.exports.createCollection= createCollection;
module.exports.createMeet= createMeet;
module.exports.insertMember= insertMember;
module.exports.getMembers= getMembers;

