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
                // search();
            } else {
                console.log('enter city');
                document.getElementById('meet-addrs').placeholder = 'Enter a city';
            }
        }


        function search() {
            var search = {
                bounds: map.getBounds(),
                types: ['lodging']
            };

            places.nearbySearch(search, function(results, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    clearResults();
                    clearMarkers();
                    // Create a marker for each hotel found, and
                    // assign a letter of the alphabetic to each marker icon.
                    for (var i = 0; i < results.length; i++) {
                        var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
                        var markerIcon = MARKER_PATH + markerLetter + '.png';
                        // Use marker animation to drop the icons incrementally on the map.
                        markers[i] = new google.maps.Marker({
                            position: results[i].geometry.location,
                            animation: google.maps.Animation.DROP,
                            icon: markerIcon
                        });
                        // If the user clicks a hotel marker, show the details of that hotel
                        // in an info window.
                        markers[i].placeResult = results[i];
                        google.maps.event.addListener(markers[i], 'click', showInfoWindow);
                        setTimeout(dropMarker(i), i * 100);
                        addResult(results[i], i);
                    }
                }
            });
        }

        function addResult(result, i) {
            var results = document.getElementById('results');
            var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
            var markerIcon = MARKER_PATH + markerLetter + '.png';

            var tr = document.createElement('tr');
            tr.style.backgroundColor = (i % 2 === 0 ? '#F0F0F0' : '#FFFFFF');
            tr.onclick = function() {
                google.maps.event.trigger(markers[i], 'click');
            };

            var iconTd = document.createElement('td');
            var nameTd = document.createElement('td');
            var icon = document.createElement('img');
            icon.src = markerIcon;
            icon.setAttribute('class', 'placeIcon');
            icon.setAttribute('className', 'placeIcon');
            var name = document.createTextNode(result.name);
            iconTd.appendChild(icon);
            nameTd.appendChild(name);
            tr.appendChild(iconTd);
            tr.appendChild(nameTd);
            results.appendChild(tr);
        }

        function showInfoWindow() {
            var marker = this;
            places.getDetails({placeId: marker.placeResult.place_id},
                function(place, status) {
                    if (status !== google.maps.places.PlacesServiceStatus.OK) {
                        return;
                    }
                    infoWindow.open(map, marker);
                    buildIWContent(place);
                });
        }

        function dropMarker(i) {
            return function() {
                markers[i].setMap(map);
            };
        }



        function clearMarkers() {
            for (var i = 0; i < markers.length; i++) {
                if (markers[i]) {
                    markers[i].setMap(null);
                }
            }
            markers = [];
        }

        function clearResults() {
            var results = document.getElementById('results');
            while (results.childNodes[0]) {
                results.removeChild(results.childNodes[0]);
            }
        }
    })

    $scope.createMeet= function(){
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
                    members: [{name: $scope.hostName, location: location}]
                }
            }).then(function(response){
                console.log(response);
                var meet= response.data.result;
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

                        centroidMarker= new google.maps.Marker({
                            map: map,
                            position: new google.maps.LatLng(centroid.lat, centroid.lng),
                            icon: green,
                            title: 'Meet Location'
                        })
                        map.fitBounds(bounds);
                        google.maps.event.trigger(map, 'resize');
                        map.setZoom(15);
                    });
                }
            })
        // })
    };

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
                    }else{
                        console.log('err in finding places', response.data.result[0]);
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
        var green= new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|34BA46");
        var bounds = new google.maps.LatLngBounds();
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 28.6139, lng: 77.2090},
            zoom: 8
        });

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
                bounds.extend(member.location);
            });
            console.log(memberMarker);


            centroid.lat/= response.length;
            centroid.lng/= response.length;
            getNearbyPlaces(centroid, 500).then(function (result) {

                console.log(result);
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

            centroidMarker= new google.maps.Marker({
                map: map,
                position: new google.maps.LatLng(centroid.lat, centroid.lng),
                icon: green,
                title: 'Meet Location'
            });
            map.fitBounds(bounds);
            google.maps.event.trigger(map, 'resize');
        });



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


        // function search() {
        //     var search = {
        //         bounds: map.getBounds(),
        //         types: ['lodging']
        //     };
        //
        //     places.nearbySearch(search, function(results, status) {
        //         if (status === google.maps.places.PlacesServiceStatus.OK) {
        //             clearResults();
        //             clearMarkers();
        //             // Create a marker for each hotel found, and
        //             // assign a letter of the alphabetic to each marker icon.
        //             for (var i = 0; i < results.length; i++) {
        //                 var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
        //                 var markerIcon = MARKER_PATH + markerLetter + '.png';
        //                 // Use marker animation to drop the icons incrementally on the map.
        //                 markers[i] = new google.maps.Marker({
        //                     position: results[i].geometry.location,
        //                     animation: google.maps.Animation.DROP,
        //                     icon: markerIcon
        //                 });
        //                 // If the user clicks a hotel marker, show the details of that hotel
        //                 // in an info window.
        //                 markers[i].placeResult = results[i];
        //                 google.maps.event.addListener(markers[i], 'click', showInfoWindow);
        //                 setTimeout(dropMarker(i), i * 100);
        //                 addResult(results[i], i);
        //             }
        //         }
        //     });
        // }
        //
        // function addResult(result, i) {
        //     var results = document.getElementById('results');
        //     var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
        //     var markerIcon = MARKER_PATH + markerLetter + '.png';
        //
        //     var tr = document.createElement('tr');
        //     tr.style.backgroundColor = (i % 2 === 0 ? '#F0F0F0' : '#FFFFFF');
        //     tr.onclick = function() {
        //         google.maps.event.trigger(markers[i], 'click');
        //     };
        //
        //     var iconTd = document.createElement('td');
        //     var nameTd = document.createElement('td');
        //     var icon = document.createElement('img');
        //     icon.src = markerIcon;
        //     icon.setAttribute('class', 'placeIcon');
        //     icon.setAttribute('className', 'placeIcon');
        //     var name = document.createTextNode(result.name);
        //     iconTd.appendChild(icon);
        //     nameTd.appendChild(name);
        //     tr.appendChild(iconTd);
        //     tr.appendChild(nameTd);
        //     results.appendChild(tr);
        // }
        //
        // function showInfoWindow() {
        //     var marker = this;
        //     places.getDetails({placeId: marker.placeResult.place_id},
        //         function(place, status) {
        //             if (status !== google.maps.places.PlacesServiceStatus.OK) {
        //                 return;
        //             }
        //             infoWindow.open(map, marker);
        //             buildIWContent(place);
        //         });
        // }
        //
        // function dropMarker(i) {
        //     return function() {
        //         markers[i].setMap(map);
        //     };
        // }
        //
        //
        //
        // function clearMarkers() {
        //     for (var i = 0; i < markers.length; i++) {
        //         if (markers[i]) {
        //             markers[i].setMap(null);
        //         }
        //     }
        //     markers = [];
        // }
        //
        // function clearResults() {
        //     var results = document.getElementById('results');
        //     while (results.childNodes[0]) {
        //         results.removeChild(results.childNodes[0]);
        //     }
        // }
    })

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
                        location: location
                    }
                }
            }).then(function (response) {
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




