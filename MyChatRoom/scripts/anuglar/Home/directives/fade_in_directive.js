angular.module("MyChatRoom.directives").directive("fadeIn", ['$parse', function ($parse) {
    return {
        restrict: 'E',
        scope:{
            show: '=',
            onShow:'='
        },
        link: function (scope, elem, attr) {
            if(!scope.show) $(elem).hide();

            scope.$watch('show', function (newVal) {
                if (!newVal) {
                    $(elem).fadeOut();
                } else {
                    if (scope.onShow) scope.onShow();
                    $(elem).fadeIn();
                }
            });
        }
    }
}]);