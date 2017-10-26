indexModule.controller('hostCtrl', ['$rootScope', '$scope', '$http', '$q', '$location',  function($rootScope, $scope, $http, $q, $location){

    var map;
    $scope.meetAddrs;
    $scope.meetName;
    $scope.hostName;
    $rootScope.joinHost= 'join';

    var memberMarker= [];
    var centroidMarker;;
    var marker;
    var placesMarker= [];
    var centroid= {lat: 0.0, lng: 0.0};
    var maxLoc={lat: -90, lng: -180};
    var minLoc={lat: 90, lng: 180};
    $scope.members= [];
    $scope.places= [];
    $scope.afterCreate= false;
    var id;
    // --------------------------------

    $.getScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyB2RoGEwsoZLm5ZbY_gsaNzIQdmls4dAi8&callback&libraries=places").then(function (script) {



        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 28.6139, lng: 77.2090},
            zoom: 8
        });

        var  places, infoWindow;
        var markers = [];
        var MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';

        var autocomplete;
        autocomplete = new google.maps.places.Autocomplete(
            /** @type {!HTMLInputElement} */ (
                document.getElementById('meet-addrs')), {
                types: ['geocode'],

            });
        places = new google.maps.places.PlacesService(map);

        autocomplete.addListener('place_changed', onPlaceChanged);

        function onPlaceChanged() {
            var place = autocomplete.getPlace();


            if (place.geometry) {
                // console.log(place);
                $scope.meetAddrs= place.formatted_address;
                map.panTo(place.geometry.location);
                map.setZoom(15);
                if(marker != undefined)
                    marker.setMap(null);
                marker= new google.maps.Marker({
                    map: map,
                    position: place.geometry.location,
                    title: 'new',
                    draggable: true
                });
                // console.log($scope.meetAddrs);

            } else {
                console.log('enter city');
                document.getElementById('meet-addrs').placeholder = 'Enter a city';
            }
        }

    });

    $scope.createMeet= function(){
        if($scope.meetAddrs==undefined || $scope.meetName== undefined || $scope.hostName== undefined || marker== undefined){
            return;
        }
        // getLatLong().then(function(result){
        //     console.log(result);
        // console.log();
        var bounds = new google.maps.LatLngBounds();
        var green= new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|34BA46");
        var location= {
            lat:marker.position.lat(),
            lng: marker.position.lng()
        }
        $http({
            method: 'POST',
            url: '/create_meet',
            data: {
                name: $scope.meetName,
                location: location,
                host: $scope.hostName,
                members: [{name: $scope.hostName, location: location, address: $scope.meetAddrs}]
            }
        }).then(function(response){
            marker.setMap(null);
            marker= undefined;
            $scope.meetAddrs='';
            $scope.meetName='';
            console.log(response);
            var meet= response.data.result;
            id= meet.result[0]._id;
            if(meet.success){
                // console.log(meet.result[0]._id);
                // $location.path('/join/'+ meet.result[0]._id);

                getMembers(meet.result[0]._id).then(function (response) {
                    console.log(response);
                    $scope.members= response;

                    var location;
                    response.forEach(function (member, i) {
                        console.log(member.location);
                        // location= {lat: member.location.lat, lng: member.location.long}
                        memberMarker[i]= new google.maps.Marker({
                            map: map,
                            position: new google.maps.LatLng(member.location.lat, member.location.lng),
                            title: member.name
                        });
                        // if(member.location.lat> maxLoc.lat){
                        //     maxLoc.lat= member.location.lat;
                        // }else if(member.location.lat< minLoc.lat){
                        //     minLoc.lat= member.location.lat;
                        // }
                        //
                        // if(member.location.lng> maxLoc.lng){
                        //     maxLoc.lng= member.location.lng;
                        // }else if(member.location.lng< minLoc.lng){
                        //     minLoc.lng= member.location.lng;
                        // }
                        centroid.lat+= parseFloat(member.location.lat);
                        centroid.lng+= parseFloat(member.location.lng);
                        bounds.extend(member.location);
                    });
                    console.log(memberMarker);


                    centroid.lat/= response.length;
                    centroid.lng/= response.length;
                    getNearbyPlaces(centroid, 500).then(function (result) {

                        // console.log(result);
                        // map.panTo(centroid);
                        $scope.places= result;
                        result.forEach(function (place, i) {
                            placesMarker= new google.maps.Marker({
                                map: map,
                                position: place.geometry.location,
                                icon: {url: place.icon, scaledSize: new google.maps.Size(20, 20)},
                                // icon: place.icon,
                                title: place.name
                            })
                            // map.setZoom(15);
                            bounds.extend(place.geometry.location);
                        })
                    });
                    if(centroidMarker!= undefined){
                        centroidMarker.setMap(null);
                    }
                    centroidMarker= new google.maps.Marker({
                        map: map,
                        position: new google.maps.LatLng(centroid.lat, centroid.lng),
                        icon: green,
                        title: 'Meet Location'
                    })
                    map.fitBounds(bounds);
                    google.maps.event.trigger(map, 'resize');
                    map.setZoom(15);
                    $scope.afterCreate= true;
                });
            }
        })
        // })
    };

    $scope.invite= function () {
        var storage= {id: id}
        localStorage.setItem('browserStorage', JSON.stringify(storage));
        $location.path('/share');
    }

    function getLatLong(){
        console.log('getLatLong()');
        return $q(
            function(resolve, reject){
                $http({
                    method: 'GET',
                    url: '/getLatLong',
                    params: {address: $scope.meetAddrs}
                }).then(function(response){
                    console.log(response);
                    if(response.data.success){
                        resolve(response.data);
                    }
                })
            }
        )
    }

    function getMembers(id) {
        console.log(id);
        return $q(
            function (resolve, reject) {
                $http({
                    method: 'GET',
                    url: '/get_members',
                    params: {id: id}
                }).then(function (response) {
                    if(response.data.success){
                        resolve(response.data.result[0].members);
                    }
                    else{
                        console.log('err getMembers');
                        console.log(response);
                    }
                    // console.log(response);
                })
            }
        )
    }

    function getNearbyPlaces(centroid, radius) {
        // var radius;
        // var latDiff= maxLoc.lat- minLoc.lat;
        // var lngDiff= maxLoc.lng- minLoc.lng;
        // var radius= Math.ceil(Math.max(latDiff, lngDiff))* 0.20 *111000;
        // console.log(radius);
        return $q(
            function (resolve, reject) {
                $http({
                    method: 'GET',
                    url: '/get_nearby_places',
                    params: {
                        location: centroid,
                        radius: radius
                    }
                }).then(function (response) {
                    console.log(response);
                    if(response.data.success){
                        resolve(response.data.result);
                    }else if(response.data.result.json.status== 'ZERO_RESULTS'){
                        console.log('err in finding places');
                        resolve(getNearbyPlaces(centroid, radius+500));
                    }else{
                        console.log('err in finding places');
                    }
                })
            }
        )
    }




}]);

indexModule.controller('joinCtrl', ['$rootScope', '$scope', '$http', '$q', '$routeParams', function($rootScope, $scope, $http, $q, $routeParams){
    console.log('joinCtrl');
    // console.log($routeParams.id);
    var id= $routeParams.id;

    $rootScope.joinHost= 'host';
    var memberMarker= [];
    var centroidMarker;
    $scope.memberAddrs= '';
    $scope.memberName= '';
    var marker;
    var placesMarker= [];
    var centroid= {lat: 0.0, lng: 0.0};
    var maxLoc={lat: -90, lng: -180};
    var minLoc={lat: 90, lng: 180};
    $scope.members= [];
    $scope.places= [];

    $.getScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyB2RoGEwsoZLm5ZbY_gsaNzIQdmls4dAi8&callback&libraries=places").then(function (script) {
        $scope.green= new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|34BA46");
        $scope.bounds = new google.maps.LatLngBounds();
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 28.6139, lng: 77.2090},
            zoom: 8
        });

        loadData();

        var  places, infoWindow;
        var markers = [];

        var MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';

        var autocomplete;
        autocomplete = new google.maps.places.Autocomplete(
            /** @type {!HTMLInputElement} */ (
                document.getElementById('join-addrs')), {
                types: ['geocode'],

            });
        places = new google.maps.places.PlacesService(map);

        autocomplete.addListener('place_changed', onPlaceChanged);

        function onPlaceChanged() {
            var place = autocomplete.getPlace();


            if (place.geometry) {
                console.log(place.geometry.location);
                $scope.memberAddrs= place.formatted_address;
                map.panTo(place.geometry.location);
                map.setZoom(15);
                if(marker != undefined)
                    marker.setMap(null);
                marker= new google.maps.Marker({
                    map: map,
                    position: place.geometry.location,
                    title: 'new',
                    draggable: true
                });
                // google.maps.event.addListener(marker, 'drag', function (event) {
                //     console.log(this.position.lat(), this.position.lng());
                //     $scope.memberAddrs=
                // });
                console.log(marker.position.lat());
                // search();
            } else {
                console.log('enter city');
                document.getElementById('join-addrs').placeholder = 'Enter a city';
            }
        }
    });

    function loadData() {
        centroid= {lat: 0.0, lng: 0.0};
        getMembers().then(function (response) {
            console.log(response);
            $scope.members= response;

            var location;
            response.forEach(function (member, i) {
                console.log(member.location);
                // location= {lat: member.location.lat, lng: member.location.long}
                memberMarker[i]= new google.maps.Marker({
                    map: map,
                    position: new google.maps.LatLng(member.location.lat, member.location.lng),
                    title: member.name
                });
                // if(member.location.lat> maxLoc.lat){
                //     maxLoc.lat= member.location.lat;
                // }else if(member.location.lat< minLoc.lat){
                //     minLoc.lat= member.location.lat;
                // }
                //
                // if(member.location.lng> maxLoc.lng){
                //     maxLoc.lng= member.location.lng;
                // }else if(member.location.lng< minLoc.lng){
                //     minLoc.lng= member.location.lng;
                // }
                centroid.lat+= parseFloat(member.location.lat);
                centroid.lng+= parseFloat(member.location.lng);
                $scope.bounds.extend(member.location);
            });
            console.log(memberMarker);


            centroid.lat/= response.length;
            centroid.lng/= response.length;
            getNearbyPlaces(centroid, 500).then(function (result) {

                console.log(result);
                clearPlaces();
                // map.panTo(centroid);
                $scope.places= result;
                result.forEach(function (place, i) {
                    placesMarker[i]= new google.maps.Marker({
                        map: map,
                        position: place.geometry.location,
                        icon: {url: place.icon, scaledSize: new google.maps.Size(20, 20)},
                        // icon: place.icon,
                        title: place.name
                    })
                    // map.setZoom(15);
                    $scope.bounds.extend(place.geometry.location);
                })
            });
            if(centroidMarker!= undefined){
                centroidMarker.setMap(null);
            }
            centroidMarker= new google.maps.Marker({
                map: map,
                position: new google.maps.LatLng(centroid.lat, centroid.lng),
                icon: $scope.green,
                title: 'Meet Location'
            });
            map.fitBounds($scope.bounds);
            google.maps.event.trigger(map, 'resize');
        });
    }

    $scope.joinMeet= function(){
        // getLatLong().then(function (result) {
        console.log($scope.memberName);
        if($scope.memberName== undefined|| $scope.memberName== ' '|| $scope.memberName==''|| marker== undefined){
            return;
        }
        var location= {
            lat:marker.position.lat(),
            lng: marker.position.lng()
        }

        $http({
            method: 'POST',
            url: ('/join_meet'),
            data: {
                match: id,
                value:{
                    name: $scope.memberName,
                    location: location,
                    address: $scope.memberAddrs
                }
            }
        }).then(function (response) {
            console.log('joinedMeet');
            marker.setMap(null);
            marker= undefined;
            $scope.memberAddrs= '';
            $scope.memberName= '';
            console.log(marker);
            loadData();
            console.log(response);
        })
        // })

    };

    function getMembers() {
        console.log(id);
        return $q(
            function (resolve, reject) {
                $http({
                    method: 'GET',
                    url: '/get_members',
                    params: {id: id}
                }).then(function (response) {
                    if(response.data.success){
                        resolve(response.data.result[0].members);
                    }
                    else{
                        console.log('err getMembers');
                        console.log(response);
                    }
                    // console.log(response);
                })
            }
        )
    }

    function getLatLong(){
        console.log('getLatLong() '+ $scope.memberAddrs);
        return $q(
            function(resolve, reject){
                $http({
                    method: 'GET',
                    url: '/getLatLong',
                    params: {address: $scope.memberAddrs}
                }).then(function(response){
                    console.log(response);
                    if(response.data.success){
                        resolve(response.data);
                    }
                })
            }
        )
    }

    function getNearbyPlaces(centroid, radius) {
        // var radius;
        // var latDiff= maxLoc.lat- minLoc.lat;
        // var lngDiff= maxLoc.lng- minLoc.lng;
        // var radius= Math.ceil(Math.max(latDiff, lngDiff))* 0.20 *111000;
        // console.log(radius);
        return $q(
            function (resolve, reject) {
                $http({
                    method: 'GET',
                    url: '/get_nearby_places',
                    params: {
                        location: centroid,
                        radius: radius
                    }
                }).then(function (response) {
                    console.log(response);
                    if(response.data.success){
                        resolve(response.data.result);
                    }
                    else if(response.data.result.json.status== 'ZERO_RESULTS'){
                        console.log('err in finding places');
                        resolve(getNearbyPlaces(centroid, radius+500));
                    }
                    else{
                        console.log('err in finding places');
                    }
                })
            }
        )
    }

    function clearPlaces(){
        placesMarker.forEach(function (place, i) {
            place.setMap(null);
        })
    }


}]);




