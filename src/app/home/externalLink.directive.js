angular.module('ngBoilerplate.home.externalLink', [])
    .directive('externalLink', function () {
        return {
            restrict: 'E',
            transclude: true,
            replace: true,
            template: '<a ng-transclude></a>',
            link: function (scope, element, attr) {
                // Use NW's gui.Shell and open an external link in the users default browser.
                var gui = require('nw.gui');
                element.bind('click', function(e) {
                    e.preventDefault();
                    var link = ! /^http/.test(attr.href) ? 'http://' + attr.href : attr.href;
                    gui.Shell.openExternal(link);
                });
            }
        };
    });