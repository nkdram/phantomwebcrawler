(function () {
    'use strict';

    angular.module('dashboard').controller('DashboardController', ['$scope', 'Authentication','$http','$sce',
        function ($scope, Authentication, $http, $sce) {
            $scope.authentication = Authentication;
            var socket = io.connect();

            $scope.init = function(){
                $scope.data = {};
                $scope.logs = [];
                $scope.html = {rawHtml : '<div class="col-md-6 col-md-offset-3">' +
                ' <span class="badge col-md-offset-3"> HTML WILL LOAD HERE </span> </div>'};
                $scope.crawlStatus = false;

            };

            $scope.crawlSite = function()
            {
                $scope.crawlStatus = true;
                socket.emit("crawl", $scope.data);
            };

            $scope.clearCrawl = function()
            {
                $scope.init();
                //Add others if required
            };

            socket.on("crawlDone", function(data){
                $scope.crawlStatus = false;
                $scope.logs = [];
               // console.log(  data.result.html );
                $scope.html =  { rawHtml : data.result.html };
                if(!$scope.$$phase)
                {
                    $scope.$apply();
                }
            });



            socket.on("log", function(data){
                console.log('Inside Log');
                $scope.logs.push(data);
                if(!$scope.$$phase)
                {
                    $scope.$apply();
                }
            });
    }])
})();

