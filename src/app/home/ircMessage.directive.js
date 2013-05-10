var emailRegex = /([a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)/ig,
    urlRegex = /(\b(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)[\-A-Z0-9+&@#\/%=~_|$?!:,.]*[A-Z0-9+&@#\/%=~_|$])/ig,
    nl2brRegex = /([^>\r\n]?)(\r\n|\n\r|\r|\n)/g;

angular.module('ngBoilerplate.home.ircMessage', [])
    .directive('ircMessage', function () {
        return {
            scope: {
                message: '='
            },
            restrict: 'E',
            link: function (scope, element) {
                var text = scope.message;
                // create clickable emails
                text = text.replace(emailRegex, '<a href="mailto:$1" target="_blank">$1</a>');

                // Create clickable links
                text = text.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');

                // Do nl2br
                text = text.replace(nl2brRegex, '$1<br>$2');

                element.html(text);
            }
        };
    });
