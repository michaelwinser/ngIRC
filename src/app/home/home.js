angular.module('ngBoilerplate.home', [
        'titleService',
        'ngBoilerplate.home.scrollBottom',
        'ngBoilerplate.home.ircMessage',
        'ngBoilerplate.home.ircService'
    ])

    .config(function config($routeProvider) {
        $routeProvider.when('/home', {
            controller: 'HomeCtrl',
            templateUrl: 'home/home.tpl.html'
        });
    })

    .controller('HomeCtrl', function HomeController($scope, titleService, ircService) {
        titleService.setTitle('ngIRC');

        /**
         * Private variables and functions
         */
        var ircServer,
            addMessage = function(channel, messageData) {
                if (typeof $scope.channels[channel] !== 'undefined') {
                    $scope.channels[channel].messages.push(messageData);
                }
            },
            joinChannel = function(channel) {
                if (channel.charAt(0) !== '#') {
                    channel = '#' + channel;
                }

                ircServer.join(channel, function(channel) {
                    $scope.channels[channel] = {
                        messages: [],
                        users: {},
                        active: true
                    };
                    addMessage(channel, {
                        date: new Date(),
                        user: 'System',
                        text: '*** Now talking on ' + channel
                    });
                });
            },
            partChannel = function(channel) {
                ircServer.part(channel);
                delete $scope.channels[channel];
            },
            changeNick = function(newNick) {
                ircServer.changeNick(newNick);
                $scope.inputs.nickname = newNick;
            };

        /**
         * Scope variables and functions
         */
        $scope.channels = {};
        $scope.systemMessages = [];
        $scope.connecting = false;
        $scope.connected = false;
        $scope.inputs = {
            server: 'chat.freenode.net',
            port: 6667,
            nickname: null,
            message: null,
            initialChannel: '#ngIRC',
            channel: null
        };

        $scope.modalOpts = {
            backdropClick: false
        };

        $scope.connectClient = function() {
            if (! $scope.inputs.nickname || ! $scope.inputs.initialChannel) {
                return;
            }

            $scope.connecting = true;

            ircService
                .connect($scope.inputs.server, $scope.inputs.nickname, {port: $scope.inputs.port})
                .success(function(server) {
                    ircServer = server;
                    joinChannel($scope.inputs.initialChannel);
                    $scope.connected = true;
                });
        };

        $scope.sendMessage = function(channel) {
            if ($scope.inputs.message.charAt(0) === '/') {
                var parts = $scope.inputs.message.match(/^\/(.*?)(?:\s(.*))?$/),
                    command = parts[1],
                    args = (typeof parts[2] !== 'undefined') ? parts[2].split(' ') : null;
                switch (command) {
                    case 'join':
                        joinChannel(args[0]);
                        break;
                    case 'part':
                        partChannel(channel);
                        break;
                    case 'nick':
                        changeNick(args[0]);
                        break;
                }
            } else {
                ircServer.channel(channel).say($scope.inputs.message);

                addMessage(channel, {
                    date: new Date(),
                    user: $scope.inputs.nickname,
                    text: $scope.inputs.message
                });
            }

            $scope.inputs.message = '';
        };

        $scope.addChannel = function() {
            joinChannel($scope.inputs.channel);
            $scope.inputs.channel = '';
        };

        $scope.disconnect = function() {
            ircService.disconnect('Cya bitches!', function() {
                $scope.connecting = false;
                $scope.connected = false;
                $scope.channels = {};
                $scope.systemMessages = [];
            });
        };

        /**
         * Events broadcasted from ircService
         */
        $scope.$on('irc.message', function(event, data) {
            addMessage(data.channel, data);
        });

        $scope.$on('irc.systemMessage', function(event, data) {
            $scope.systemMessages.push(data);
        });

        $scope.$on('irc.nicks', function(event, data) {
            $scope.channels[data.channel].users = data.nicks;
        });
    })
;