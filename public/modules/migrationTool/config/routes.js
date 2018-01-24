(function () {
    'use strict';

    // Setting up route
    angular.module('migrationtool').config(['$stateProvider',
        function ($stateProvider) {
            // Users state routing
            $stateProvider.
                state('configureSite', {
                    url: '/configuresite',
                    templateUrl: '/assets/modules/migrationTool/views/configureSite.html'
                })

        }
    ]);
})();

