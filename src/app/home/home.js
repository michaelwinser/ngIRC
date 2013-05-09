angular.module('ngBoilerplate.home', [
        'titleService',
        'ngBoilerplate.home.directives'
    ])

    .config(function config($routeProvider) {
        $routeProvider.when('/home', {
            controller: 'HomeCtrl',
            templateUrl: 'home/home.tpl.html'
        });
    })

    .controller('HomeCtrl', function HomeController($scope, titleService) {
        var irc = require('irc'),
            client,
            pinger,
            pingInterval = 1000 * 60 * 2; // every 2 mins

        titleService.setTitle('ngIRC');

        $scope.messages = [];
        $scope.users = [];
        $scope.nickname = '';
        $scope.channel = 'ngIRC';
        $scope.server = 'card.freenode.net';
        $scope.port = 6667;
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
                    channels: ['#' + $scope.channel], // Channels to connect to
                    port: $scope.port
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

                pinger = setInterval(function() {
                    client.send('PING', $scope.server);
                }, pingInterval);

                $scope.$digest();
            });

            client.addListener('join', function(channel, nick, raw) {
                $scope.messages.push({
                    date: new Date(),
                    user: 'System',
                    text: '*** '+ nick + ' has joined ' + channel,
                    serverMessage: true
                });

                $scope.$digest();
            });

            client.addListener('part', function(channel, nick, raw) {
                $scope.messages.push({
                    date: new Date(),
                    user: 'System',
                    text: '*** '+ nick + ' has left ' + channel,
                    serverMessage: true
                });

                $scope.$digest();
            });

            client.addListener('message', function(from, channel, text, raw) {
                $scope.messages.push({
                    date: new Date(),
                    user: from,
                    text: text
                });

                $scope.$digest();
            });

            client.addListener('names', function(channel, nicks) {
                $scope.users = nicks;

                $scope.$digest();
            });

            /**
             * Catch Errors
             */
            client.addListener('error', function(error) {
                console.log(error);
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
            client.disconnect('Cya bitches!', function() {
                $scope.connected = false;
                clearInterval(pinger);
                $scope.messages = [];
                $scope.$digest();
            });
        };
    })
;