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
        'titleService',
        'ngBoilerplate.home.directives'
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
        var irc = require('irc'),
            client;

        titleService.setTitle('ngIRC');

        $scope.messages = [];
        $scope.users = [];
        $scope.nickname = '';
        $scope.channel = 'ngIRC';
        $scope.server = 'card.freenode.net';
        $scope.connected = false;

        $scope.connectClient = function() {
            if (! $scope.nickname || ! $scope.channel) {
                return;
            }

            $scope.connected = true;

            client = new irc.Client(
                $scope.server, // Server
                $scope.nickname, // Nickname
                {
                    channels: ['#' + $scope.channel] // Channels to connect to
                }
            );

            client.addListener('notice', function(nick, to, text) {
                $scope.messages.push({
                    date: new Date(),
                    user: 'System',
                    text: text,
                    serverMessage: true
                });

                $scope.$digest();
            });

            client.addListener('registered', function(raw) {
                $scope.messages.push({
                    date: new Date(),
                    user: 'System',
                    text: raw.args[1],
                    serverMessage: true
                });

                $scope.$digest();
            });

            client.addListener('message#' + $scope.channel, function(from, message) {
                $scope.messages.push({
                    date: new Date(),
                    user: from,
                    text: message
                });

                $scope.$digest();
            });

            client.addListener('names', function(channel, nicks) {
                $scope.users = nicks;

                $scope.$digest();
            });


        };

        $scope.sendMessage = function() {
            if (client) {
                /**
                 * message#channel event does not run the callback for messages sent from the client
                 * which is the reason we have to manually push() in the message in the $scope.sendMessage()
                 * function.
                 */
                $scope.messages.push({
                    date: new Date(),
                    user: $scope.nickname,
                    text: $scope.message
                });

                client.say('#' + $scope.channel, $scope.message);

                $scope.message = '';
            }
        };

        /**
         * TODO: Fix disconnect when it's already timed out.
         */
        $scope.disconnect = function() {
            console.log('trying to disconnect...');
            client.disconnect('Cya bitches!', function() {
                $scope.connected = false;
                $scope.messages = [];
                $scope.$digest();
            });
        };
    })
;