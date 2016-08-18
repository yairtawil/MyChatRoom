angular.module("MyChatRoom.directives").directive("scrollToEnd", ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        link: function ($scope, elem) {
            $scope.$watch('scrollToEnd.open_modal_action', function () {
                if ($scope.scrollToEnd.open_modal_action && !$scope.scrollToEnd.load_more_action) {
                    $scope.scrollToEnd.open_modal_action = false;
                    $(elem[0]).animate({ scrollTop: $(elem[0]).prop("scrollHeight") + 1000 }, 100);
                    $scope.selected_user.height_before_load = $(elem[0]).prop("scrollHeight");
                }
            });
            $scope.$watch('scrollToEnd.load_more_action', function () {
                if ($scope.scrollToEnd.load_more_action) {
                    $scope.scrollToEnd.load_more_action = false;
                    var num_to_scroll = $(elem[0]).prop("scrollHeight") - $scope.selected_user.height_before_load;
                    $scope.selected_user.height_before_load = $(elem[0]).prop("scrollHeight");
                    $(elem[0]).animate({ scrollTop: num_to_scroll }, 0);
                    $(elem[0]).css({"transition": "1s"});
                }
            });
         
            $(elem[0]).scroll(function (e) {
                $timeout(function () {
                    $scope.selected_user.load_more = $(elem[0]).scrollTop() === 0;
                }, 0);
            });
        }
    }
}]);