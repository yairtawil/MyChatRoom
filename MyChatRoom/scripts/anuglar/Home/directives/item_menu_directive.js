angular.module("MyChatRoom.directives").directive("itemMenu", ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function ($scope, elem, attr) {
            var itemMenu = $parse(attr.itemMenu)($scope);
            $(elem).contextmenu(function (e) {
                e.preventDefault();
                $scope.$apply(function () {
                    $scope.item_menu.show = true;
                    $scope.item_menu.type = itemMenu.type;
                    $scope.item_menu.selected_user = itemMenu.selected_user;
                    $scope.item_menu.x = e.clientX;
                    $scope.item_menu.y = e.clientY;
                })
            })
            $(document).click(function (event) {
                $scope.$apply(function () {
                    $scope.item_menu.show = false;
                })
            });
        }
    }
}]);