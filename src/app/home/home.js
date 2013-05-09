angular.module('ngBoilerplate.home', [
        'titleService',
        'ngBoilerplate.home.directives',
        'ngBoilerplate.home.services'
    ])

    .config(function config($routeProvider) {
        $routeProvider.when('/home', {
            controller: 'HomeCtrl',
            templateUrl: 'home/home.tpl.html'
        });
    })

    .controller('HomeCtrl', function HomeController($scope, titleService, ircService) {
        titleService.setTitle('ngIRC');

        var ircServer,
            addMessage = function(channel, messageData) {
                if (typeof $scope.channels[channel] !== 'undefined') {
                    $scope.channels[channel].messages.push(messageData);
                }
            },
            joinChannel = function(channel) {
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
            };

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
                    if ($scope.inputs.initialChannel.charAt(0) !== '#') {
                        $scope.inputs.initialChannel = '#' + $scope.inputs.initialChannel;
                    }

                    joinChannel($scope.inputs.initialChannel);
                    $scope.connected = true;
                });
        };

        $scope.$on('irc.message', function(event, data) {
            addMessage(data.channel, data);
        });

        $scope.$on('irc.systemMessage', function(event, data) {
            $scope.systemMessages.push(data);
        });

        $scope.$on('irc.nicks', function(event, data) {
            $scope.channels[data.channel].users = data.nicks;
        });

        $scope.sendMessage = function(channel) {
            if ($scope.inputs.message.charAt(0) === '/') {
                var parts = $scope.inputs.message.match(/^\/(.*?)(?:\s(.*))?$/),
                    command = parts[1],
                    args = parts[2];
                switch (command) {
                    case 'part':
                        ircServer.part(channel);
                        delete $scope.channels[channel];
                        break;
                    case 'nick':
                        ircServer.changeNick(args);
                        $scope.inputs.nickname = args;
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
            if ($scope.inputs.channel.charAt(0) !== '#') {
                $scope.inputs.channel = '#' + $scope.inputs.channel;
            }

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
    })
;