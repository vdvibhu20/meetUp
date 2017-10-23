
function getGoogleMapsClient(){

    var googleMapsClient = require('@google/maps').createClient({
        key: 'AIzaSyB2RoGEwsoZLm5ZbY_gsaNzIQdmls4dAi8'
    });

    return googleMapsClient;
}


module.exports.getGoogleMapsClient= getGoogleMapsClient;