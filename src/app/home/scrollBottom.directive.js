angular.module('ngBoilerplate.home.directives', [])
    .directive('scrollBottom', function () {
        return {
            restrict: 'E',
            scope: {
                height: '@height',
                watch: '=watch'
            },
            transclude: true,
            template: '<div ng-transclude ng-style="{height: height, overflowY: \'scroll\'}"></div>',
            controller: function postLink($scope, $element, $timeout) {
                $scope.$watch('watch', function() {
                    var div = $element.children()[0];
                    $timeout(function() {
                        div.scrollTop = div.scrollHeight;
                    }, 50);
                }, true);
            }
        };
    });
