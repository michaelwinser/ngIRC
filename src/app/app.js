angular.module('ngBoilerplate', [
        'app-templates',
        'component-templates',
        'ngBoilerplate.home',
        'ui.bootstrap',
        'ui.route'
    ])

    .config(function myAppConfig($routeProvider) {
        $routeProvider.otherwise({ redirectTo: '/home' });
    })

    .run(function run(titleService) {

    })

    .controller('AppCtrl', function AppCtrl($scope, $location) {
    })

;

