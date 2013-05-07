/**
 * Each section of the site has its own module. It probably also has
 * submodules, though this boilerplate is too simple to demonstrate it. Within
 * `src/app/home`, however, could exist several additional folders representing
 * additional modules that would then be listed as dependencies of this one.
 * For example, a `note` section could have the submodules `note.create`,
 * `note.delete`, `note.edit`, etc.
 *
 * Regardless, so long as dependencies are managed correctly, the build process
 * will automatically take take of the rest.
 *
 * The dependencies block here is also where component dependencies should be
 * specified, as shown below.
 */
angular.module('ngBoilerplate.home', [
        'titleService'
    ])

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
    .config(function config($routeProvider) {
        $routeProvider.when('/home', {
            controller: 'HomeCtrl',
            templateUrl: 'home/home.tpl.html'
        });
    })

/**
 * Obviously this is all hard coded in and will need to be entered in by the user when they first launch
 * the application.  The code I've added is just to get it working.  And it's working quit well :).
 */
    .controller('HomeCtrl', function HomeController($scope, titleService) {
        titleService.setTitle('Home');
        $scope.messages = [];

        var irc = require('irc'),
            client = new irc.Client(
                'hubbard.freenode.net', // Server
                'ngIRC', // Nickname
                {
                    channels: ['#ngIRC'], // Channels to connect to
                    userName: 'ngIRC',
                    realName: 'ngIRC IRC client',
                    port: 6667,
                    debug: false,
                    showErrors: false,
                    autoRejoin: true,
                    autoConnect: true,
                    secure: false,
                    selfSigned: false,
                    certExpired: false,
                    floodProtection: false,
                    floodProtectionDelay: 1000,
                    stripColors: false,
                    channelPrefixes: "&#",
                    messageSplit: 512
                }
            );

        /**
         * message#channel event does not run the callback for messages sent from the client
         * which is the reason we have to manually push() in the message in the $scope.sendMessage()
         * function.
         */
        client.addListener('message#ngIRC', function(from, message) {
            $scope.messages.push({
                date: new Date(),
                from: from,
                message: message
            });

            $scope.$digest();
        });

        $scope.sendMessage = function() {
            $scope.messages.push({
                date: new Date(),
                from: 'ngIRC',
                message: $scope.message
            });

            client.say('#ngIRC', $scope.message);

            $scope.message = '';
        };
    })
;