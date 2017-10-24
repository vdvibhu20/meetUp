indexModule.controller('shareLinkCtrl', ['$scope', '$location', function ($scope, $location) {
    $scope.path= 'http://localhost:3001/#!/join/';
    $scope.id= JSON.parse(localStorage.getItem('browserStorage')).id;
    console.log($scope.id);
    $scope.path+= $scope.id;
    
    
    $scope.copy= function () {
        var text= document.getElementById('share-link');
        text.select();
        document.execCommand('copy');
    }

    $scope.addMembers= function () {
        // var path= 'http://localhost:3001/#!/join/'+ $scope.id;
        console.log($scope.path);
        $location.path('/join/'+ $scope.id);
    }
}]);