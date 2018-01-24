(function () {
    'use strict';

    angular.module('migrationtool').controller('MigrationToolController', ['$scope', 'Authentication', '$http', '$sce',
        function ($scope, Authentication, $http, $sce) {
            $scope.authentication = Authentication;
            var socket = io.connect();
            var browserStorage = window.localStorage;

            $scope.clearConfig = function(){
                browserStorage.setItem('config', '');
            };

            $scope.init = function(){
               var getItem = browserStorage.getItem('config');
                var jsonData = JSON.parse(getItem);
                if(jsonData) {
                    $scope.data = {
                        url: jsonData.url,
                        scUrl: jsonData.scUrl,
                        scUsername: jsonData.scUsername
                    };
                }
            };
            socket.on("conversionDone", function(result){
                var urlList = [];
                if(result.result){
                    var urls = result.result.urlset.url;
                    for(var i=0;i< urls.length; i++){
                        if(urlList.indexOf(urls[i].loc[0]) == -1)
                         urlList.push(urls[i].loc[0]);
                    }
                }

                var dataStored = {
                    url: $scope.data.url,
                    scUrl:$scope.data.scUrl,
                    scUsername: $scope.data.scUsername,
                    siteUrls : urlList
                };
                browserStorage.setItem('config', JSON.stringify(dataStored));
            });
            $scope.Config = function () {

                socket.emit('convertToJson',$scope.data.xml);
                /*formData.append('userid', $scope.authentication.user.id);
                pageLoader.setAttribute('style', 'display:block');
                $scope.insertStarted = false;
                $http.post('/fileupload', formData,
                    {
                        transformRequest: angular.identity,
                        headers: {'Content-Type': undefined}
                    }
                ).success(function (data, status, headers, config) {

                        if (status === 200 && data !== null && data !== '') {
                            // data = {customerData: data, userid: $scope.authentication.user.id};
                            $scope.progressstatus.maxcount =  data.total;
                            $scope.insertStarted = true;
                        } else {
                            $scope.error = 'The uploaded Data is not valid.';
                            pageLoader.setAttribute('style', 'display:none');
                        }
                    }).error(function (data, status, headers, config) {
                        $scope.error = data.message;
                        pageLoader.setAttribute('style', 'display:none');
                    });

                // Call after 20 secs to file insertion status
                $interval(function () {
                        $scope.customerDataPost();
                    }
                    ,10000)*/
            };

        }])
})();
