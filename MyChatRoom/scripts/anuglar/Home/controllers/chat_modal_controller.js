angular.module("MyChatRoom.controllers").controller("chatModalController", function ($scope, data, $timeout, $http, $state) {

    //if (!$scope.selected_user) {
    //    $state.go("home");
    //};
    $scope.keyCodesArray = {};

    $scope.keyup = function ($event) {
        $scope.keyCodesArray[$event.keyCode] = false;
    };

    $scope.selectUser = function (user, type) {
        $scope.openChat(user, type);
    };

    $scope.chatUsers = function () {
        var users = [];
        _.forEach($scope.selected_user.UserIds, function (userId) {
            var user = _.find($scope.users, { Id: userId });
            if (user) users.push(user);
        });
        return users;
    };
 
    $scope.allreadMsg = function (msg) {
        if (msg.to_id) {
            return _.includes(msg.readIds, msg.to_id);
        } else {
            var group = _.find($scope.groups, { Id: msg.group_id });
            var UserIds = _.cloneDeep(group.UserIds);
            var index_from_id = UserIds.indexOf(msg.from_id);
            if (index_from_id !== -1) UserIds.splice(index_from_id, 1);
            return _.size(UserIds) === _.size(msg.readIds);
        }
    };
    $scope.anyReadMsg = function (msg) {
        if (msg.to_id) {
            return false;
        } else {
            var group = _.find($scope.groups, { Id: msg.group_id });
            var UserIds = _.cloneDeep(group.UserIds);
            var index_from_id = UserIds.indexOf(msg.from_id);
            if (index_from_id !== -1) UserIds.splice(index_from_id, 1);
            return _.size(msg.readIds) !== 0 && _.size(msg.readIds) < _.size(UserIds) && !$scope.allreadMsg(msg);
        }
        
    };

    $scope.getMsgToArray = function (msg) {
        if (!msg) return;
        if (msg.to_id) {
            return [msg.to_id];
        } else {
            var group = _.find($scope.groups, { Id: msg.group_id });
            var userIdsWithoutFromIdUser = _.cloneDeep(group.UserIds);
            var index_of_from_id = userIdsWithoutFromIdUser.indexOf(msg.from_id);
            userIdsWithoutFromIdUser.splice(index_of_from_id, 1);
            return userIdsWithoutFromIdUser;
        }
    };

    $scope.isRead = function (msg, user_id) {
        if (msg.from_id === user_id) return true;
        return _.includes(msg.readIds, user_id)
    };

    $scope.keydown = function ($event) {
        $scope.keyCodesArray[$event.keyCode] = true;
        if ($scope.chatMsg.types[$scope.chatMsg.type] === 'Textarea' && $scope.keyCodesArray[13] && $scope.keyCodesArray[17]) {
            $scope.submitMsg();
        }
        if ($scope.keyCodesArray[16] && $scope.keyCodesArray[17]) {
            $scope.chatMsg.len = $scope.chatMsg.len === 'HEB' ? $scope.chatMsg.len = 'ENG' : $scope.chatMsg.len = 'HEB'
        }
    };

    $scope.typing = function ($event) {
        var my_messages = _.filter($scope.selected_user.Message, { from_id: data.currentUserId() });
        var sizeof_my_messages = _.size(my_messages);


        if ($event.keyCode === 13) return // Enter ~ Send
        if ($event.keyCode === 38) {
            if ($scope.chatMsg.index < sizeof_my_messages) {
                $scope.chatMsg.index++;
                var right_index = sizeof_my_messages - $scope.chatMsg.index;
                $scope.chatMsg.input = my_messages[right_index].text;
            }
        }
        if ($event.keyCode === 40) {
            if ($scope.chatMsg.index > 1) {
                $scope.chatMsg.index--;
                var right_index = sizeof_my_messages - $scope.chatMsg.index;
                $scope.chatMsg.input = my_messages[right_index].text;
            }
        }
        var typing_event = {
            Type: "Typing",
            Typing: {
                ClientId: $scope.selected_user.Id,
                Type: $scope.selected_user.type,
                FromId: data.currentUserId()
            }
        };
        $scope.webSocketSend(typing_event);

    };

    $scope.splitToLines = function (str) {
        return str.split("\n");
    };

    $scope.submitMsg = function () {
        if (!$scope.chatMsg.input) return;
        var msg_event = {};
        switch ($scope.selected_user.type) {
            case "users":
                msg_event = {
                    Type: "ChatMessage",
                    ChatMessage: {
                        from_id: data.currentUserId(),
                        to_id: $scope.selected_user.Id,
                        text: $scope.chatMsg.input,
                        len: $scope.chatMsg.len
                    }
                }
                break;
            case "groups":
                msg_event = {
                    Type: "ChatMessage",
                    ChatMessage: {
                        from_id: data.currentUserId(),
                        group_id: $scope.selected_user.Id,
                        text: $scope.chatMsg.input,
                        len: $scope.chatMsg.len
                    }
                }
                break;
        }
        $scope.webSocketSend(msg_event);
        $scope.chatMsg.input = "";
        //$scope.chatMsg.index = 0;
    };
});