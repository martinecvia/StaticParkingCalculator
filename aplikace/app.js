var app = angular.module('calculator', ["ui.bootstrap"]);

app.controller("form", ["$scope", function($scope) {

    $scope.Math = window.Math;

    $scope.okresy = Object.keys(okresy);
    $scope.obce   = Object.keys(obce);
    $scope.stavby = Object.keys(stavby);

    $scope.$watch("okres", function(o, n){

    });

    $scope.$watch("obec", function(o, n){
        
    });

    $scope.recalculate = function() {

    };

    $scope.$watch("stavbyList", $scope.recalculate, true);

}]);