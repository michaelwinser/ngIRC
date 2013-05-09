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
                },
                changeNick: function(newNick) {
                    client.send('NICK', newNick);
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
                     * Emitted when a notice is sent. to can be either a nick (which is most likely this clients nick
                     * and means a private message), or a channel (which means a message to that channel). nick is
                     * either the senders nick or null which means that the notice comes from the server.
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
                     * Emitted when the server sends the initial 001 line, indicating you’ve connected to the server.
                     */
                    client.addListener('registered', function(raw) {
                        $rootScope.$apply(function() {
                            $rootScope.$broadcast('irc.systemMessage', {
                                date: new Date(),
                                user: 'System',
                                text: raw.args[1],
                                raw: raw
                            });

                            pinger = setInterval(function() {
                                client.send('PING', server);
                            }, pingInterval);

                            deferred.resolve(ircServer);
                        });
                    });

                    /**
                     * Emitted when the server sends the message of the day to clients.
                     */
                    client.addListener('motd', function(motd) {
                        $rootScope.$apply(function() {
                            $rootScope.$broadcast('irc.systemMessage', {
                                date: new Date(),
                                user: 'System',
                                text: motd
                            });

                            pinger = setInterval(function() {
                                client.send('PING', server);
                            }, pingInterval);

                            deferred.resolve(ircServer);
                        });
                    });


                    /**
                     * Emitted when a message is sent to any channel (i.e. exactly the same as the message
                     * event but excluding private messages.
                     */
                    client.addListener('message#', function(from, channel, text, raw) {
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

                    /**
                     * Emitted when the server sends the channel topic on joining a channel, or when a user
                     * changes the topic on a channel.
                     */
                    client.addListener('topic', function(channel, topic, nick, raw) {
                        $rootScope.$apply(function() {
                            $rootScope.$broadcast('irc.message', {
                                date: new Date(),
                                channel: channel,
                                user: 'System',
                                text: '*** Topic on ' + channel + ' is:' + topic,
                                raw: raw
                            });

                            $rootScope.$broadcast('irc.message', {
                                date: new Date(),
                                channel: channel,
                                user: 'System',
                                text: '*** Topic set by: ' + nick,
                                raw: raw
                            });
                        });
                    });

                    /**
                     * Emitted when a user joins a channel (including when the client itself joins a channel).
                     */
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

                    /**
                     * Emitted when a user parts a channel (including when the client itself parts a channel).
                     */
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

                    /**
                     * Emitted when a user disconnects from the IRC, leaving the specified array of channels.
                     */
                    client.addListener('quit', function(nick, reason, channels, raw) {
                        $rootScope.$apply(function() {
                            for (var i = 0; i < channels.length; i++) {
                                $rootScope.$broadcast('irc.message', {
                                    date: new Date(),
                                    channel: channels[i],
                                    user: 'System',
                                    text: '*** '+ nick + ' has quit IRC: ' + reason,
                                    raw: raw
                                });
                            }
                        });
                    });

                    /**
                     * Emitted when a user disconnects from the IRC, leaving the specified array of channels.
                     */
                    client.addListener('quit', function(nick, reason, channels, raw) {
                        $rootScope.$apply(function() {
                            for (var i = 0; i < channels.length; i++) {
                                $rootScope.$broadcast('irc.message', {
                                    date: new Date(),
                                    channel: channels[i],
                                    user: 'System',
                                    text: '*** '+ nick + ' has quit IRC: ' + reason,
                                    raw: raw
                                });
                            }
                        });
                    });

                    /**
                     * Emitted when a user is killed from the IRC server. channels is an array of channels the killed
                     * user was in which are known to the client.
                     */
                    client.addListener('kill', function(nick, reason, channels, raw) {
                        $rootScope.$apply(function() {
                            for (var i = 0; i < channels.length; i++) {
                                $rootScope.$broadcast('irc.message', {
                                    date: new Date(),
                                    channel: channels[i],
                                    user: 'System',
                                    text: '*** '+ nick + ' has been killed: ' + reason,
                                    raw: raw
                                });
                            }
                        });
                    });

                    /**
                     * Emitted when a user changes nick along with the channels the user is in.
                     */
                    client.addListener('nicks', function(oldNick, newNick, channels, raw) {
                        $rootScope.$apply(function() {
                            for (var i = 0; i < channels.length; i++) {
                                $rootScope.$broadcast('irc.message', {
                                    date: new Date(),
                                    channel: channels[i],
                                    user: 'System',
                                    text: '*** '+ oldNick + ' is now: ' + newNick,
                                    raw: raw
                                });
                            }
                        });
                    });

                    /**
                     * Emitted when a user is kicked from a channel.
                     */
                    client.addListener('kick', function(channel, nick, by, reason, raw) {
                        $rootScope.$apply(function() {
                            $rootScope.$broadcast('irc.message', {
                                date: new Date(),
                                channel: channel,
                                user: 'System',
                                text: '*** '+ by + ' has kicked ' + nick + ' from the channel: ' + reason,
                                raw: raw
                            });
                        });
                    });

                    /**
                     * Emitted when the server sends a list of nicks for a channel (which happens immediately after
                     * joining and on request. The nicks object passed to the callback is keyed by nick names, and has
                     * values ‘’, ‘+’, or ‘@’ depending on the level of that nick in the channel.
                     */
                    client.addListener('names', function(channel, nicks) {
                        $rootScope.$apply(function() {
                            $rootScope.$broadcast('irc.nicks', {
                                channel: channel,
                                nicks: nicks
                            });
                        });
                    });

                    /**
                     * As per ‘message’ event but only emits when the message is direct to the client.
                     */
                    client.addListener('pm', function(nick, text, raw) {
                        $rootScope.$apply(function() {
                            $rootScope.$broadcast('irc.pm', {
                                from: nick,
                                text: text,
                                raw: raw
                            });
                        });
                    });

                    /**
                     * Emitted when the client recieves an /invite.
                     */
                    client.addListener('invite', function(channel, from, raw) {
                        $rootScope.$apply(function() {
                            $rootScope.$broadcast('irc.invite', {
                                from: from,
                                channel: channel,
                                raw: raw
                            });
                        });
                    });

                    /**
                     * Emitted when a mode is added to a user or channel. channel is the channel which the mode is
                     * being set on/in. by is the user setting the mode. mode is the single character mode identifier.
                     * If the mode is being set on a user, argument is the nick of the user. If the mode is being set
                     * on a channel, argument is the argument to the mode. If a channel mode doesn’t have any arguments,
                     * argument will be ‘undefined’.
                     */
                    client.addListener('+mode', function(channel, by, mode, argument, raw) {
                        $rootScope.$apply(function() {
                            $rootScope.$broadcast('irc.message', {
                                date: new Date(),
                                channel: channel,
                                user: 'System',
                                text: '*** '+ by + ' sets mode +' + mode + ' ' + (argument ? argument : ''),
                                raw: raw
                            });
                        });
                    });

                    /**
                     * Emitted when a mode is removed from a user or channel. channel is the channel which the mode is
                     * being set on/in. by is the user setting the mode. mode is the single character mode identifier.
                     * If the mode is being set on a user, argument is the nick of the user. If the mode is being set
                     * on a channel, argument is the argument to the mode. If a channel mode doesn’t have any arguments,
                     * argument will be ‘undefined’.
                     */
                    client.addListener('-mode', function(channel, by, mode, argument, raw) {
                        $rootScope.$apply(function() {
                            $rootScope.$broadcast('irc.message', {
                                date: new Date(),
                                channel: channel,
                                user: 'System',
                                text: '*** '+ by + ' sets mode -' + mode + ' ' + (argument ? argument : ''),
                                raw: raw
                            });
                        });
                    });

                    /**
                     * Emitted whenever the server finishes outputting a WHOIS response.
                     */
                    client.addListener('whois', function(info) {
                        $rootScope.$apply(function() {
                            $rootScope.$broadcast('irc.whois', info);
                        });
                    });

                    /**
                     * Emitted when ever the server responds with an error-type message.
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
                    // Reset all after disconnect
                    client = null;
                    channels = {};
                    clearInterval(pinger);
                    $rootScope.$apply(fn);
                });
            }
        };
    });