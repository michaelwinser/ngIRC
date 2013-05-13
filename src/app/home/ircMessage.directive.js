var emailRegex = /([a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)/ig,
    urlRegex = /(\b(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)[\-A-Z0-9+&@#\/%=~_|$?!:,.]*[A-Z0-9+&@#\/%=~_|$])/ig,
    nl2brRegex = /([^>\r\n]?)(\r\n|\n\r|\r|\n)/g;

angular.module('ngBoilerplate.home.ircMessage', [])
    .directive('ircMessage', function ($compile) {
        return {
            scope: {
                message: '='
            },
            restrict: 'E',
            link: function (scope, element) {
                var text = scope.message;
                // create clickable emails
                text = text.replace(emailRegex, '<external-link href="mailto:$1">$1</external-link>');

                // Create clickable links
                text = text.replace(urlRegex, '<external-link href="$1">$1</external-link>');

                // Do nl2br
                text = text.replace(nl2brRegex, '$1<br>$2');

                element.html(text);

                $compile(element.contents())(scope);
            }
        };
    });
