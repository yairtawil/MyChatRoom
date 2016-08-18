angular.module("MyChatRoom.controllers").controller("createGroupController", function ($scope, data, $timeout, $http, $state) {
    var ROLE = 0;
    $scope.atLeastOneUser = function (users) {
        return _.size(_.filter(users, function (user) {
            if (user) {
                return user;
            }
        })) > 0;
    };

    $scope.createGroup = function () {
        $http({
            method: 'POST',
            url: "http://localhost:58250/Group/CreateGroup",
            headers: {
                'Content-Type': "application/json",
            },
            data: {
                name: $scope.create_group.name,
                users: $scope.selectedUsers(),
                adminId: data.currentUserId()
            }
        }).then(function () {
            $scope.create_group.action = false;
        })
    };

    $scope.GroupAdmin = function () {
        if ($scope.create_group.id) {
            var group = _.find($scope.groups, { Id: $scope.create_group.id });
            return group.AdminId === data.currentUserId();
        }
        return true;

    };

    $scope.editGroup = function () {
        $http({
            method: 'POST',
            url: "http://localhost:58250/Group/EditGroup",
            headers: {
                'Content-Type': "application/json",
            },
            data: {
                name: $scope.create_group.name,
                users: $scope.selectedUsers(),
                adminId: data.currentUserId(),
                groupId: $scope.create_group.id
            }
        }).then(function () {
            $scope.create_group.action = false;
        })
    };

    $scope.selectedUsersCount = function () {
        return _.size($scope.selectedUsers()) + 1;
    };

    $scope.selectedUsers = function () {
        var users_keys = Object.keys($scope.create_group.users);
        return users_keys.filter(function (key) { return $scope.create_group.users[key] });
    };

    $scope.closeCreateGroup = function () {
        $scope.create_group.action = false;
        $scope.create_group.name = '';
        $scope.create_group.old_name = '';
        $scope.create_group.users = {};
        $scope.create_group.id = null;
    };

});