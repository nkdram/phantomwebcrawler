(function () {
    'use strict';

    angular.module('dashboard').controller('DashboardController', ['$scope', 'Authentication','$http',
        function ($scope, Authentication,$http) {
            $scope.authentication = Authentication;
            var socket = io.connect();
            $scope.data = {};
            socket.emit("crawl", {});
    }])
})();

