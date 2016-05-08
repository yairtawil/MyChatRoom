angular.module("MyChatRoom.controllers").controller("mainController", function ($scope, data, $timeout, $http) {
    $scope.ws = {};
    $scope.chatMsg = {
        input: ""
    };
    $scope.scrollToEnd = {
        action: false
    };

    $scope.chat_modal = {
        show: false
    };

    $scope.readAllMsgs = function () {
        $http({
            method: 'POST',
            url: "http://localhost:58250/api/Message" + "/" + data.currentUserId() + "/" + $scope.selected_user.Id,
            headers: {
                'Content-Type': "application/json",
            },
        }).then(
           function (response) {
               console.log("response = ", response);
               _.forEach($scope.selected_user.Message, function (msg) {
                   msg.read = true;
               });
           },
           function () {
           }
        );
    };
    $scope.getAllUsers = function () {
        $http({
            method: 'GET',
            url: "http://localhost:58250/api/User" + "/" + data.currentUserId(),
            headers: {
                'Content-Type': "application/json",
            },
        }).then(
           function (response) {
               console.log("response = ", response);
               $scope.users = JSON.parse(response.data);
               $scope.initSocketConnection();
           },
           function () {
           }
        );
    };

    $scope.openChat = function (user) {
        $scope.chat_modal.show = true;
        $scope.selected_user = user;
        $scope.readAllMsgs();
        //$scope.ws.send(
        //    JSON.stringify({
        //        Type: "OpenChatBoxId",
        //        OpenChatBoxId: user.Id
        //    })
        //);
    };
    $scope.closeChat = function () {
        $scope.chat_modal.show = false;
        $scope.selected_user = null;
    };
    $scope.initSocketConnection = function () {

        $scope.ws = new WebSocket("ws://localhost:58250/Home/StartChat?id=" + data.currentUserId() + "&name=" + data.currentUserName());
        $scope.ws.onopen = function (evt) {
            console.log("onopen evt= ", evt);
        };
        $scope.ws.onclose = function (evt) {
            console.log("onclose evt= ", evt);
        };
        $scope.ws.onmessage = function (evt) {
            $timeout(function () {
                var parse_json = JSON.parse(evt.data);
                switch (parse_json.Type) {
                    case "ChatMessage":
                        parse_json = parse_json.ChatMessage;
                        var from_id = parse_json.from_id;
                        var to_id = parse_json.to_id;
                        var text = parse_json.text;
                        var messages_box_id = from_id === data.currentUserId() ? to_id : from_id;
                        var user = _.find($scope.users, { Id: messages_box_id });
                        user.Message.push(parse_json);
                        $scope.scrollToEnd.action = true;
                        if ($scope.selected_user && $scope.selected_user.Id === messages_box_id) {
                            $scope.readAllMsgs();
                        }
                        break;
                    case "OpenChatBox":
                        parse_json = parse_json.OpenChatBox;
                        var chatBoxId = parse_json.chatBoxId;
                        var userMessages = parse_json.userMessages;
                        var user = _.find($scope.users, { Id: chatBoxId });
                        if (user) {
                            user.Message = userMessages;
                        }
                        break;
                }
            }, 0);
        };
        $scope.ws.onerror = function (evt) {
            console.log("onerror evt= ", evt);
        }
    };
    $scope.init = function () {
        $scope.getAllUsers();
        $scope.data = data;

    };

    $scope.getUnReadMessage = function (Messages) {
        return _.size(_.filter(Messages, { to_id: data.currentUserId(), read: false }));
    };

    $scope.submitMsg = function () {
        if ($scope.ws.readyState == WebSocket.OPEN) {
            $scope.ws.send(
                JSON.stringify(
                {
                    Type: "ChatMessage",
                    ChatMessage: {
                        from_id: data.currentUserId(),
                        to_id: $scope.selected_user.Id,
                        text: $scope.chatMsg.input
                    }
                }
                )
            )
        }
        else {
            $("#spanStatus").text("Connection is closed");
        }
        $scope.chatMsg.input = "";
    };
});