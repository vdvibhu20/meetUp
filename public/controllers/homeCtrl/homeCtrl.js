indexModule.controller('homeCtrl', ['$rootScope', '$scope', '$http', '$location', function($rootScope, $scope, $http, $location){
    $scope.university= '';
    $rootScope.joinHost= false;

    $scope.createMeet= function(){
        $location.path('/join_host');
    }
}]);