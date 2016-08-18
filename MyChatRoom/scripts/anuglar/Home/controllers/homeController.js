angular.module("MyChatRoom.controllers").controller("homeController", function ($scope, data, $timeout, $http, $state, settingsService) {
    var randomColor = function (user) {
        user.Color = "#" + ((1 << 24) * Math.random() | 0).toString(16);
        user.Page = 1;
    };
    var ROLE = 0;

    $scope.settingsService = settingsService;

    $scope.timeoutsPromises = {
        users: {},
        groups: {}
    };

    $scope.selected_msg = { message: null };

    $scope.itemMenu = function (type) {
        $scope.item_menu.type = type;
        return $scope.item_menu;
    };

    $scope.create_group = {
        action: null,
        name: "",
        id: null,
        users: {}
    };

    $scope.ws = {};

    $scope.chatMsg = {
        input: "",
        types: ["Input", "Textarea"],
        len: "HEB",
        type: 0,
        index: 0
    };

    $scope.scrollToEnd = {
        open_modal_action: false,
        load_more_action: false
    };

    $scope.alerts = [];
    $scope.users = {};

    $scope.openTabs = {
        activeIndex: -1,
        tabs: []
    };

    $scope.createditGroup = function (group, type) {
        if (group) {
            $scope.create_group.id = group.Id;
            $scope.create_group.name = group.Name;
            $scope.create_group.old_name = group.Name;
            _.forEach(group.UserIds, function (id) {
                if (id !== data.currentUserId()) {
                    $scope.create_group.users[id] = true;
                }
            });
        }
        $scope.create_group.action = true;
    };

    var messagesValues = function (selected_user, Messages, Page) {
        Messages = Messages ? Messages : selected_user.Message;
        selected_user.Page = Page ? Page : 1;
        selected_user.last_data_count = _.size(Messages);
        selected_user.no_more_data = selected_user.last_data_count < $scope.MESSAGES_COUNT;
    };

    $scope.getUserMessages = function () {
        $http({
            method: 'GET',
            url: "http://localhost:58250/api/Message" + "/" + ROLE + "/" + data.currentUserId() + "/" + $scope.selected_user.Id + "?page=" + $scope.selected_user.Page,
            headers: {
                'Content-Type': "application/json",
            },
        }).then(
          function (response) {
              messagesValues($scope.selected_user, response.data.Messages, response.data.Page);
              _.forEach($scope.selected_user.Message, function (msg) {
                  msg.transition = false;
              });
              _.forEach(response.data.Messages, function (msg) {
                  msg.disappear = true;
                  msg.transition = true;
                  $scope.selected_user.Message.unshift(msg);
              });

              $scope.scrollToAction('load_more_action');

              $timeout(function () {
                  _.forEach($scope.selected_user.Message, function (msg) {
                      msg.disappear = false;
                  })
              }, 200)

          },
          function () {
          }
       );
    };

    $scope.readAllMsgs = function () {
        $http({
            method: 'POST',
            url: "http://localhost:58250/api/Message" + "/" + ROLE + "/" + data.currentUserId() + "/" + $scope.selected_user.Id + "?type=" + $scope.selected_user.type,
            headers: {
                'Content-Type': "application/json",
            },
        }).then(
           function (response) {
               _.forEach($scope.selected_user.Message, function (msg) {
                   if (msg.from_id !== data.currentUserId()) {
                       var isRead = _.includes(msg.readIds, data.currentUserId());
                       if (!isRead) msg.readIds.push(data.currentUserId());
                   }
               });
               if ($scope.ws.readyState == WebSocket.OPEN) {
                   $scope.ws.send(
                       JSON.stringify(
                       {
                           Type: "ReadMessages",
                           ReadMessages: {
                               FromId: data.currentUserId(),
                               ToId: $scope.selected_user.Id,
                               Type: $scope.selected_user.type
                           }
                       }
                       )
                   )
               }
           },
           function () {
           }
        );
    };

    $scope.getAllUsers = function () {
        $http({
            method: 'GET',
            url: "http://localhost:58250/api/User" + "/" + ROLE + "/" + data.currentUserId(),
            headers: {
                'Content-Type': "application/json",
            },
        }).then(
           function (response) {
               console.log("response = ", response);
               $scope.users = response.data.Users;
               _.map($scope.users, randomColor);
               _.forEach($scope.users, function (selected_user) {
                   messagesValues(selected_user, selected_user.Message, selected_user.Page);
               });
               $scope.groups = response.data.Groups;
               $scope.initSocketConnection();
           },
           function () {
           }
        );
    };

    //$scope.getAllGroups = function () {
    //    $http({
    //        method: 'GET',
    //        url: "http://localhost:58250/api/Group" + "/" + ROLE + "/" + data.currentUserId(),
    //        headers: {
    //            'Content-Type': "application/json",
    //        },
    //    }).then(
    //       function (response) {
    //           console.log("response = ", response);
    //           $scope.groups = response.data;
    //           _.forEach($scope.groups, function (selected_group) {
    //               messagesValues(selected_group, selected_group.Message, selected_group.Page);
    //           });
    //       },
    //       function () {
    //       }
    //    );
    //};

    $scope.Alert = function (alert) {
        $scope.alerts.push(alert);
        $timeout(function () {
            alert.disappear = true;
        }, 5000);
        $timeout(function () {
            $scope.alerts.pop();
        }, 6000);
    };

    var pushOrGetIndex = function (arr, elem) {
        var index = _.findIndex(arr, { Id: elem.Id, type: elem.type });
        if (index === -1) {
            index = arr.push(elem) - 1;
            $timeout($scope.openTabs.scrollEnd, 0);
        } else {
            $scope.ScrollToTab(index);
        }
        return index;
    };

    $scope.openChat = function (user, type) {
        //$state.go("home.chat_modal");
        $scope.selected_user = user;
        $scope.selected_msg.message = null;
        $scope.selected_user.type = type;
        $scope.readAllMsgs();
        $scope.scrollToAction('open_modal_action');
        $scope.openTabs.activeIndex = pushOrGetIndex($scope.openTabs.tabs, { Id: user.Id, type: type });
    };

    $scope.openChatFromTab = function (selected_tab) {
        var user = selected_tab.type === 'users' ? _.find($scope.users, { Id: selected_tab.Id }) : _.find($scope.groups, { Id: selected_tab.Id })
        $scope.openChat(user, selected_tab.type);
    };

    $scope.closeChatTab = function (index) {
        $scope.openTabs.tabs.splice(index, 1);
        if (_.size($scope.openTabs.tabs) === 0) {
            $scope.openTabs.activeIndex = -1;
            $scope.selected_user = null;
            return;
        }
        $scope.openTabs.activeIndex = $scope.openTabs.activeIndex === index ? (($scope.openTabs.activeIndex + 1) % _.size($scope.openTabs.tabs)) : $scope.openTabs.activeIndex;
        $scope.openChatFromTab($scope.openTabs.tabs[$scope.openTabs.activeIndex]);
    };

    $scope.getUserNameById = function (id, type) {
        var user = _.find($scope[type], { Id: id });
        return user ? user.Name : id === data.currentUserId() ? "You" : "";
    }

    $scope.moreThenOneSelected = function () {
        return _.size(_.filter($scope.users, { is_selected: true })) < 2;
    };

    $scope.initSocketConnection = function () {

        $scope.ws = new WebSocket("ws://localhost:58250/Home/StartChat?id=" + data.currentUserId() + "&name=" + data.currentUserName());
        $scope.ws.onopen = function (evt) {
            console.log("onopen evt= ", evt);
        };
        $scope.ws.onclose = function (evt) {
            console.log("onclose evt= ", evt);
        };
        var my_trunc = function (text, size) {
            if (text.length < size) {
                return text
            }
            return text.slice(0, size) + "...";
        };
        $scope.ws.onmessage = function (evt) {
            $timeout(function () {
                var parse_json = JSON.parse(evt.data);
                switch (parse_json.Type) {
                    case "ChatMessage":  
                        parse_json = parse_json.ChatMessage;
                        if (parse_json.from_id !== data.currentUserId()) {
                            settingsService.messageSoundPlay();
                        }
                        if (parse_json.group_id) {
                            var from_id = parse_json.from_id;
                            var group_id = parse_json.group_id;
                            var text = parse_json.text;
                            var group = _.find($scope.groups, { Id: group_id });
                            group.Message.push(parse_json);
                            if ($scope.selected_user && $scope.selected_user.type === 'groups' && $scope.selected_user.Id === group_id) {
                                $scope.readAllMsgs();
                            } else {
                                $scope.Alert({ type: "alert-success", from: "Messaege(" + $scope.getUserNameById(group_id, 'groups') + ") form " + $scope.getUserNameById(from_id, 'users') + ":", text: my_trunc(text, 100) });
                            }
                        } else {
                            var from_id = parse_json.from_id;
                            var to_id = parse_json.to_id;
                            var text = parse_json.text;
                            var messages_box_id = from_id === data.currentUserId() ? to_id : from_id;
                            var user = _.find($scope.users, { Id: messages_box_id });
                            user.Message.push(parse_json);
                            if ($scope.selected_user && to_id === data.currentUserId() && $scope.selected_user.Id === from_id) {
                                $scope.readAllMsgs();
                            } else {
                                if (to_id === data.currentUserId()) {
                                    $scope.Alert({ type: "alert-success", from: "Messaege form " + $scope.getUserNameById(from_id, 'users') + ":", text: my_trunc(text, 100) });
                                }
                            }
                        }

                        $scope.scrollToAction('open_modal_action');
                        break;
                    case "Connected":
                        var ConnectedId = parse_json.Connected;
                        var user = _.find($scope.users, { Id: ConnectedId });
                        if (user) {
                            user.IsConnect = true;
                            $scope.connectedEvent(user);
                            $scope.Alert({ type: "alert-info", from: user.Name + ":", text: "Has Connected" });

                        }
                        break;
                    case "DisConnected":
                        var DisConnectedId = parse_json.DisConnected;
                        var user = _.find($scope.users, { Id: DisConnectedId });
                        if (user) {
                            user.IsConnect = false;
                            $scope.connectedEvent(user);
                            $scope.Alert({ type: "alert-danger", from: user.Name + ":", text: "Has DisConnected" });
                        }
                        break;
                    case "ReadMessages":
                        var ReadMessages = parse_json.ReadMessages;

                        var WhoRead = _.find($scope.users, { Id: ReadMessages.FromId })
                        var selectedChat = ReadMessages.Type === "groups" ? _.find($scope.groups, { Id: ReadMessages.ToId }) : WhoRead;

                        if (!selectedChat || !WhoRead) return;
                        _.forEach(selectedChat.Message, function (msg) {
                            //if (msg.from_id === data.currentUserId()) {
                            var isRead = _.includes(msg.readIds, WhoRead.Id);
                            if (!isRead) msg.readIds.push(WhoRead.Id);
                            //}
                        });
                        break;
                    case "Typing":
                        var Typing = parse_json.Typing;

                        var WhoTyping = _.find($scope.users, { Id: Typing.FromId });
                        var selectedChat = Typing.Type === "groups" ? _.find($scope.groups, { Id: Typing.ClientId }) : WhoTyping;

                        if (!selectedChat || !WhoTyping) return;

                        $timeout.cancel($scope.timeoutsPromises[Typing.Type][selectedChat.Id])

                        selectedChat.Typing = {
                            active: true,
                            WhoTypingName: WhoTyping.Name
                        };

                        $scope.timeoutsPromises[Typing.Type][selectedChat.Id] = $timeout(function () {
                            selectedChat.Typing.active = false;
                        }, 500)
                        break;
                    case "GroupCreated":
                        var GroupCreated = parse_json.GroupCreated;
                        var index = $scope.groups.push(GroupCreated);
                        $scope.connectedEvent($scope.groups[index - 1]);
                        $scope.Alert({ type: "alert-success", from: "Group " + GroupCreated.Name, text: "Has Created!" });
                        break;
                    case "GroupEdited":
                        var GroupEdited = parse_json.GroupEdited;
                        var group = _.find($scope.groups, { Id: GroupEdited.Id });

                        $scope.connectedEvent(group);

                        group.Name = GroupEdited.Name;
                        group.UserIds = GroupEdited.UserIds;

                        $scope.Alert({ type: "alert-success", from: "Group '" + group.Name, text: "' was edited!" });
                        break;
                    case "LeavingGroup":
                        var LeavingGroup = parse_json.LeavingGroup;

                        var group_index = _.findIndex($scope.groups, { Id: LeavingGroup.GroupId });
                        if (group_index === -1) return;
                        var groupName = $scope.groups[group_index].Name;
                        var leaving_user = _.find($scope.users, { Id: LeavingGroup.UserId });

                        if (LeavingGroup.UserId === data.currentUserId()) {
                            var open_tab_index = _.findIndex($scope.openTabs.tabs, { Id: $scope.groups[group_index].Id, type: "groups" });
                            if (open_tab_index !== -1) $scope.closeChatTab(open_tab_index);
                            $scope.groups.splice(group_index, 1);
                            $scope.Alert({ type: "alert-danger", from: "You leave ", text: groupName + " Successfully!" });
                        } else {
                            var group = $scope.groups[group_index];
                            var index_of_user = _.findIndex(group.UserIds, function (id) { id === LeavingGroup.UserId });
                            group.UserIds.splice(index_of_user, 1);
                            $scope.Alert({ type: "alert-danger", from: "User " + leaving_user.Name, text: " leave " + groupName });
                        }
                        break;
                }
            }, 0);
        };
        $scope.ws.onerror = function (evt) {
            console.log("onerror evt= ", evt);
        }
    };
    $scope.leaveGroup = function (selected_user, type) {
        $scope.webSocketSend({
            Type: "LeavingGroup",
            LeavingGroup: {
                UserId: data.currentUserId(),
                GroupId: selected_user.Id
            }
        })
    };

    $scope.connectedEvent = function (user) {
        user.connectedEvent = true;
        $timeout(function () { user.connectedEvent = false; }, 2000);
    };

    $scope.connectedEventStyle = function (IsConnect) {
        return IsConnect ? { background: "rgba(78, 175, 76, 0.6)" } : { background: "rgba(255, 0, 0, 0.6)" };
    };

    $scope.init = function () {
        $scope.MESSAGES_COUNT = 40;
        $scope.getAllUsers();
        //$scope.getAllGroups();
        $scope.data = data;
        $scope.item_menu = {
            show: false,
            type: "users",
            x: 0,
            y: 0,
            items: {
                groups: [
                    { name: 'Chat', action: $scope.openChat },
                    { name: 'Leave Group', icon: '	glyphicon glyphicon-trash', action: $scope.leaveGroup },
                    { name: 'Details', icon: '	glyphicon glyphicon-info-sign' },
                    { name: 'Edit', icon: 'glyphicon glyphicon-pencil', action: $scope.createditGroup },
                ],
                users: [
                    { name: 'Chat', action: $scope.openChat },
                    { name: 'Details', icon: '	glyphicon glyphicon-info-sign' },
                ]
            }
        }
    };

    $scope.getUnReadMessage = function (Messages) {
        return _.size(_.filter(Messages, function (msg) {
            return msg.from_id !== data.currentUserId() && !_.includes(msg.readIds, data.currentUserId());
        }));
    };

    $scope.webSocketSend = function (event) {
        if ($scope.ws.readyState == WebSocket.OPEN) {
            $scope.ws.send(JSON.stringify(event));
        } else {
            console.log("Connection is closed");
        }

    };

    $scope.scrollToAction = function (action) {
        $timeout(function () {
            $scope.scrollToEnd[action] = true;
        }, 0);
    };
    $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
        if (toState.name === "home") {
            //$scope.selected_user = null;
            //$scope.chatMsg.input="";
            //$scope.chatMsg.index=0;
        }
    });

    $scope.init();
});