angular.module('ngBoilerplate.home.services', [])

    .factory('ircService', function ($rootScope, $q) {
        var irc = require('irc'),
            client,
            channels = {},
            pinger,
            pingInterval = 1000 * 60 * 2,
            ircServer = {
                join: function(channel, callback) {
                    return this.channel(channel, callback);
                },
                channel: function(channel, callback) {
                    if (typeof channels[channel] === 'undefined') {
                        client.join(channel, function() {
                            channels[channel] = channelServer(channel);
                            callback();
                        });
                    }

                    return channels[channel];
                },
                part: function(channel) {
                    client.part(channel);
                    delete channels[channel];
                }
            },
            channelServer = function(channel) {
                return {
                    say: function(text) {
                        client.say(channel, text);
                    },
                    ctcp: function(type, text) {
                        client.ctcp(channel, type, text);
                    }
                };
            };

        return {
            connect: function(server, nickname, options) {
                var deferred = $q.defer(),
                    promise = deferred.promise;

                promise.success = function(fn) {
                    promise.then(function(server) {
                        fn(server);
                    });

                    return promise;
                };

                promise.error = function(fn) {
                    promise.then(null, function(error) {
                        fn(error);
                    });
                };

                if (! client) {
                    client = new irc.Client(server, nickname, options);

                    /**
                     * System Notices
                     * Broadcast to irc.systemMessage
                     */
                    client.addListener('notice', function(nick, to, text, raw) {
                        $rootScope.$apply(function() {
                            $rootScope.$broadcast('irc.systemMessage', {
                                date: new Date(),
                                user: 'System',
                                text: text,
                                raw: raw
                            });
                        });
                    });

                    /**
                     * Called when finished connecting to IRC server
                     * This will also send back a promise
                     */
                    client.addListener('registered', function(raw) {
                        $rootScope.$apply(function() {
                            $rootScope.$broadcast('irc.systemMessage', {
                                date: new Date(),
                                user: 'System',
                                text: raw.args[1]
                            });

                            pinger = setInterval(function() {
                                client.send('PING', server);
                            }, pingInterval);

                            deferred.resolve(ircServer);
                        });
                    });

                    /**
                     * Channel specific messages
                     */
                    client.addListener('message', function(from, channel, text, raw) {
                        $rootScope.$apply(function() {
                            $rootScope.$broadcast('irc.message', {
                                date: new Date(),
                                channel: channel,
                                user: from,
                                text: text,
                                raw: raw
                            });
                        });
                    });

                    client.addListener('join', function(channel, nick, raw) {
                        $rootScope.$apply(function() {
                            $rootScope.$broadcast('irc.message', {
                                date: new Date(),
                                channel: channel,
                                user: 'System',
                                text: '*** '+ nick + ' has joined ' + channel,
                                raw: raw
                            });
                        });
                    });

                    client.addListener('part', function(channel, nick, raw) {
                        $rootScope.$apply(function() {
                            $rootScope.$broadcast('irc.message', {
                                date: new Date(),
                                channel: channel,
                                user: 'System',
                                text: '*** '+ nick + ' has left ' + channel,
                                raw: raw
                            });
                        });
                    });

                    client.addListener('names', function(channel, nicks) {
                        $rootScope.$apply(function() {
                            $rootScope.$broadcast('irc.nicks', {
                                channel: channel,
                                nicks: nicks
                            });
                        });
                    });

                    /**
                     * Catch Errors
                     */
                    client.addListener('error', function(error) {
                        console.log(error);
                    });
                } else {
                    deferred.resolve(ircServer);
                }

                return promise;
            },
            disconnect: function(quitMessage, fn) {
                client.disconnect(quitMessage, function() {
                    clearInterval(pinger);
                    $rootScope.$apply(fn);
                });
            }
        };
    });