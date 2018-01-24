(function () {
    'use strict';

    angular.module('dashboard').controller('DashboardController', ['$scope', 'Authentication','$http','$sce',
        function ($scope, Authentication, $http, $sce) {
            $scope.authentication = Authentication;
            var socket = io.connect();
            var browserStorage = window.localStorage;


            $scope.init = function(){
                var getItem = browserStorage.getItem('config');
                var jsonData = JSON.parse(getItem);
                $scope.configData = jsonData;
                $scope.data = {};
                $scope.logs = [];
                $scope.crawlStatus = false;
                $scope.html = {init : '<div class="col-md-6 col-md-offset-3">' +
                ' <span class="badge col-md-offset-3"> HTML WILL LOAD HERE </span> </div>',rawHtml:''};
            };

            $scope.crawlSite = function()
            {
                $scope.html = {init : '<div class="col-md-6 col-md-offset-3">' +
                ' <span class="badge col-md-offset-3"> HTML WILL LOAD HERE </span> </div>',rawHtml:''};
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
                var obj = JSON.parse(data.result.html);
                var pretty = JSON.stringify(obj, undefined, 4);
                $scope.html =  { rawHtml : pretty };
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

            $scope.focusOut = function () {
                var obj = JSON.parse($scope.data.selector);
                var pretty = JSON.stringify(obj, undefined, 4);
                $scope.data.selector = pretty;
            };

            $scope.initJSON = function() {
               var json = [{
                    "selector": ".team-member",
                    "html": false,
                    "children": [
                        {
                            "selector": "a",
                            "html": false,
                            "children": [],
                            "attr": "href"
                        },
                        {
                            "selector": "p.text-muted",
                            "html": true,
                            "children": [],
                            "attr": "href"
                        }
                    ]
                }];
                return JSON.stringify(json, undefined, 4);
            }
    }])
})();

