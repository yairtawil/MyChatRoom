angular.module("MyChatRoomAdmin.controllers").controller("adminController", function ($scope, $http, $timeout) {
    $scope.radio = {};
    $scope.create_modal = {};

    $scope.getAllUsers = function () {
        $http({
            method: 'GET',
            url: "http://localhost:58250/api/User" + "/1/1",// + data.currentUserId(),
            headers: {
                'Content-Type': "application/json",
            },
        }).then(
           function (response) {
               console.log("response = ", response);
               $scope.users = response.data;
           },
           function () {
           }
        );
    };

    $scope.deleteUser = function (id, Name) {
        if(!confirm("Delele " + Name +"?")) {
            return;
        }
        $http({
            method: 'DELETE',
            url: "http://localhost:58250/api/User" + "/1/" + id,
            headers: {
                'Content-Type': "application/json",
            },
        }).then(
           function (response) {
               $scope.users = response.data;
           },
           function () {
           }
        );
    };
    
    $scope.createUser = function (userName, userPassword, userRole) {
        $http({
            method: 'POST',
            url: "http://localhost:58250/api/User" + "/1/1"  +"?userName="+userName+"&userPassword="+userPassword+"&userRole="+userRole,
            headers: {
                'Content-Type': "application/json",
            }
        }).then(
        function (response) {
            $scope.create_modal.added_successfully = true;
            $timeout(function () {
                $scope.create_modal.added_successfully = false;
            },3000)
            $scope.users = response.data;
            $scope.create_modal.show = false;
        },
        function () {
        }
     );
    };

    $scope.onChange = function (user, type) {
        console.log('onChange User= ', user);
        console.log('onChange Type= ', type);

    };

    $scope.save = function (user) {
        $http({
            method: 'POST',
            url: "/admin/edit",
            headers: {
                'Content-Type': "application/json",
            },
            data: {
                Id: user.Id,
                Name: user.Name,
                Role: user.Role
            }
        }).then(
               function (response) {
                   console.log("response = ", response);
               },
               function () {
               }
        );

    };

    $scope.init = function () {
        $scope.getAllUsers();
    };
});