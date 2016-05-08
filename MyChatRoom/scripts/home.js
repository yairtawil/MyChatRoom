$(function () {
    var selected_modal_id = -1;

    var ws = new WebSocket("ws://localhost:58250/Home/StartChat?id=" + jQuery.data(document.body)["UserId"] + "&name=" + jQuery.data(document.body)["UserName"]);
    ws.onopen = function (evt) {
        console.log('onopen!!!! = ', evt.data);
    };
    $('#myModal').on('hide.bs.modal', function (e) {
        selected_modal_id = -1;
    });
    var openModalBtn = $("button[data-target='#myModal']");
    openModalBtn.click(function (e) {
        selected_modal_id = $(this).val();

        var target1 = $("ul[contact_id=" + selected_modal_id + "]");
        target1.animate({ scrollTop: target1.prop('scrollHeight') }, 1000);

        var unreadMsg = $("div[name=unreadMsg][row_id=" + selected_modal_id + "]");
        unreadMsg.text("0");
        unreadMsg.css({ fontSize: '18px' });
        unreadMsg.stop(true, true);

        $("div[name='chatBox']").hide();
        $("div[name='chatBox'][contact_id=" + selected_modal_id + "]").show();
    });

    
    ws.onmessage = function (evt) {
        var parse_json = JSON.parse(evt.data);

        var from_id = parse_json.From;
        var to_id = parse_json.To;
        var message = parse_json.Message;
        var from_name = parse_json.FromName;
        var to_name = parse_json.ToName

        if (from_id === jQuery.data(document.body)["UserId"]) {
            var selected_ul = $("ul[contact_id=" + to_id + "]");
            selected_ul.append("<li class='list-group-item'><b class='text-info'>" + from_name + "</b>: " + message + "</li>");
        } else {
            var selected_ul = $("ul[contact_id=" + from_id + "]");
            selected_ul.append("<li class='list-group-item'><b>" + from_name + "</b>: " + message + "</li>");
            if (selected_modal_id !== from_id.toString()) {
                var unreadMsgs = parseInt($("div[name='unreadMsg'][row_id=" + from_id + "]").text(), 10);
                var unreadMsgsDiv = $("div[name='unreadMsg'][row_id=" + from_id + "]");
                unreadMsgsDiv.text(unreadMsgs + 1);
                function runIt() {
                    unreadMsgsDiv.animate({ fontSize: '18px' }, 500);
                    unreadMsgsDiv.animate({ fontSize: '22px' }, 1000, runIt);
                }
                runIt();
            }
        }
        $("#msgInput").val("");
        var target1 = $("ul[contact_id=" + from_id + "]");
        var target2 = $("ul[contact_id=" + to_id + "]");
        target1.animate({ scrollTop: target1.prop('scrollHeight') }, 0);
        target2.animate({ scrollTop: target2.prop('scrollHeight') }, 0);
    };

    $("#chatForm").submit(function (e) {
        e.preventDefault();
        if (ws.readyState == WebSocket.OPEN) {
            ws.send(
                JSON.stringify(
                {
                    from: jQuery.data(document.body)["UserId"],
                    to: selected_modal_id,
                    message: $("#msgInput").val()
                }
                )
            )
        }
        else {
            $("#spanStatus").text("Connection is closed");
        }
    })
});