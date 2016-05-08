angular.module("MyChatRoom.directives").directive("scrollToEnd", function () {
    return {
        restrict: 'A',
        link: function ($scope, elem) {
            $scope.$watch('scrollToEnd.action', function () {
                if ($scope.scrollToEnd.action) {
                    $scope.scrollToEnd.action = false;
                    $(elem[0]).animate({ scrollTop: $(elem[0]).prop("scrollHeight")+1000 }, 0);
                }
            });
        }
    }
});