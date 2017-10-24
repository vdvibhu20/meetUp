var indexModule= angular.module('meetup', ['ngRoute']);

indexModule.config(['$routeProvider',
    function($routeProvider){
        $routeProvider
            .when('/', {
                templateUrl: '/templates/home/home.html',
                controller: 'homeCtrl'
            })
            .when('/login', {
                templateUrl: '../templates/login/login.html',
                controller: 'loginCtrl'
            })
            .when('/join_host', {
                templateUrl: '/templates/joinHost/joinHost.html',
                controller: 'hostCtrl'
            })
            .when('/join/:id', {
                templateUrl: '/templates/joinHost/joinHost.html',
                controller: 'joinCtrl'
            })
            .when('/share', {
                templateUrl: '/templates/shareLink/shareLink.html',
                controller: 'shareLinkCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    }]);