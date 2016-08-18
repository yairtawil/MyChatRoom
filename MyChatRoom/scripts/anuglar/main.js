angular.module("MyChatRoomAdmin.controllers", []);
MyChatRoomAdmin = angular.module("MyChatRoomAdmin", ["MyChatRoomAdmin.controllers"]);

angular.module("MyChatRoom.controllers", []);
angular.module("MyChatRoom.services", []);
angular.module("MyChatRoom.directives", []);
angular.module("MyChatRoom", ["MyChatRoom.controllers", "MyChatRoom.services", "MyChatRoom.directives", "ui.router", "ui.slider"]);


angular.module("MyChatRoom").config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/home");

    $stateProvider
    .state('home', {
        url: "/home",
        controller: "homeController",
        templateUrl: "../../public/Home/home.html"
    })
});