angular.module("MyChatRoom.directives").directive("tabsCarousel", ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        link: function ($scope, elem) {
            $scope.openTabs.calcDisabledArrows = function () {
                $timeout(function () {
                    $scope.openTabs.enableArrowLeft = _.size($scope.openTabs.tabs) > 7 && $(elem).scrollLeft() > 0;
                    $scope.openTabs.enableArrowRight = _.size($scope.openTabs.tabs) > 7 && $(elem).scrollLeft() < (_.size($scope.openTabs.tabs) - 6) * 149;
                }, 0);
            };

            $scope.hideArrows = function () {
                return _.size($scope.openTabs.tabs) === 0;
            };
            $scope.openTabs.scrollLeft = function () {
                var oneTab = 149;
                $(elem).animate({ scrollLeft: ($(elem[0]).scrollLeft() - oneTab) }, $scope.openTabs.calcDisabledArrows);
                console.log($(elem).scrollLeft());
            };
            $scope.openTabs.scrollRight = function () {
                var oneTab = 149;
                $(elem).animate({ scrollLeft: ($(elem[0]).scrollLeft() + oneTab) }, $scope.openTabs.calcDisabledArrows);
                console.log($(elem).scrollLeft());
            };
            $scope.openTabs.scrollEnd = function () {
                $(elem).animate({ scrollLeft: $(elem[0]).prop("scrollWidth") }, $scope.openTabs.calcDisabledArrows);
            };
            $scope.openTabs.scrollStart = function () {
                $(elem).animate({ scrollLeft: 0 }, $scope.openTabs.calcDisabledArrows);
            };

            $scope.ScrollToTab = function (tab_index) {
                var start_position = tab_index * 149;
                if ($(elem).scrollLeft() > start_position) {
                    $(elem).animate({ scrollLeft: start_position }, $scope.openTabs.calcDisabledArrows);
                    return;
                }
                if ($(elem).scrollLeft() < start_position - 5 * 149) {
                    $(elem).animate({ scrollLeft: start_position - 5 * 149 }, $scope.openTabs.calcDisabledArrows)
                    return;
                }
            }
        }

    };

}

]);