angular.module("MyChatRoom.directives").directive("buttonOnOff", ['$timeout', function ($timeout) {
    return {
        restrict: 'E',
        scope: {
            model: '=',
            change: '='
        },
        template: "<div ng-click='toggle()' class='button-on-off {{disabled ? \"disabled\" : \"\"}}' ng-class='model ? \"on\" : \"off\" '> " +
                    "<div class='ball'></div>" +
                     "{{model ? 'on' : 'off'}}" +
                   "</div>",
        link: function (scope, elem) {
            scope.disabled = $(elem).attr("disabled");
            scope.toggle = function () {
                if (scope.disabled) return;
                scope.model = !scope.model;
                console.log("model = ", scope.model);
                if (scope.change) $timeout(scope.change,0);
            };
        }
    }
}]);