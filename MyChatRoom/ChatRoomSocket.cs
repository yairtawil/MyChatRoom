using Microsoft.Web.WebSockets;
using MyChatRoom.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Script.Serialization;

namespace MySocketClass
{
    public class ChatRoomSocket : WebSocketHandler
    {
        MyChatRoomEntities1 context = new MyChatRoomEntities1();
        JavaScriptSerializer serializer = new JavaScriptSerializer();

        public static WebSocketCollection clients = new WebSocketCollection();
        public int id;
        public string name;
        public override void OnOpen()
        {
            id = Convert.ToInt32(WebSocketContext.QueryString["id"]);
            name = WebSocketContext.QueryString["name"];
            AddIfNotExist(clients, this);
            var user = context.User.SingleOrDefault(u => u.Id == id);
            user.IsConnect = true;
            context.SaveChanges();
            ChatRoomEvent e = new ChatRoomEvent { Type = "Connected", Connected = id };
            clients.Broadcast(serializer.Serialize(e));
        }
        public static void AddIfNotExist(WebSocketCollection clients, ChatRoomSocket client)
        {
            if (clients.SingleOrDefault(c => ((ChatRoomSocket)c).id == client.id) == null)
            {
                clients.Add(client);
            };
        }
        public override void OnClose()
        {
            clients.Remove(this);
            var context = new MyChatRoomEntities1();
            var user = context.User.SingleOrDefault(u => u.Id == id);
            user.IsConnect = false;
            context.SaveChanges();
            ChatRoomEvent e = new ChatRoomEvent { Type = "DisConnected", DisConnected = id };
            clients.Broadcast(serializer.Serialize(e));
        }
        public override void OnMessage(string message)
        {
            ChatRoomEvent e = serializer.Deserialize<ChatRoomEvent>(message);

            switch (e.Type)
            {
                case "ChatMessage":

                    context.Message.Add(e.ChatMessage);
                    context.SaveChanges();
                    if(e.ChatMessage.group_id != null)
                    {
                        Group g = context.Group.SingleOrDefault(gr => gr.Id == e.ChatMessage.group_id);
                        var groupUsers = context.User.Where(u => context.GroupUsers.Where(gu => gu.GroupId == g.Id && gu.UserId == u.Id).Count() != 0);
                        //var groupUsersSockets = clients.Where(c => groupUsers.Where(gu=> gu.Id == ((ChatRoomSocket)c).id).Count() != 0);
                        foreach(var user in groupUsers)
                        {
                            var client = clients.SingleOrDefault(c => ((ChatRoomSocket)c).id == user.Id);
                            if(client != null) client.Send(serializer.Serialize(e));
                        }
                    }
                    else
                    {
                        var client_to = clients.SingleOrDefault(c => ((ChatRoomSocket)c).id == e.ChatMessage.to_id);
                        var client_from = clients.SingleOrDefault(c => ((ChatRoomSocket)c).id == e.ChatMessage.from_id);

                        if (client_to != null) client_to.Send(serializer.Serialize(e));
                        if (client_from != null) client_from.Send(serializer.Serialize(e));
                    }
                    break;
                case "ReadMessages":
                    ReadMessages readMessages = e.ReadMessages;
                    switch (readMessages.Type)
                    {
                        case "users":
                            var Client = clients.SingleOrDefault(c => ((ChatRoomSocket)c).id == e.ReadMessages.ToId);
                            if (Client != null) Client.Send(serializer.Serialize(e));
                            break;
                        case "groups":
                            var SelectedGroup = context.Group.SingleOrDefault(g => g.Id == readMessages.ToId);
                            var ClientGroup = context.GroupUsers.Where(gu => gu.GroupId == SelectedGroup.Id);
                            foreach (var GroupUser in ClientGroup)
                            {
                                Client = clients.SingleOrDefault(c => ((ChatRoomSocket)c).id == GroupUser.UserId);
                                if (Client != null) Client.Send(serializer.Serialize(e));
                            }
                            break;
                    }
                    break;
                case "Typing":
                    Typing t = e.Typing;
                    switch (t.Type) {
                        case "users":
                            var Client = clients.SingleOrDefault(c => ((ChatRoomSocket)c).id == t.ClientId);
                            if (Client != null) Client.Send(serializer.Serialize(e));
                            break;
                        case "groups":
                            var SelectedGroup = context.Group.SingleOrDefault(g=>g.Id == t.ClientId);
                            var ClientGroup = context.GroupUsers.Where(gu => gu.GroupId == SelectedGroup.Id);
                            foreach(var GroupUser in ClientGroup)
                            {
                                Client = clients.SingleOrDefault(c => ((ChatRoomSocket)c).id == GroupUser.UserId);
                                if (Client != null) Client.Send(serializer.Serialize(e));
                            }
                            break;
                    }
                    break;
                case "LeavingGroup":
                    LeavingGroup l = e.LeavingGroup;
                    var group = context.Group.SingleOrDefault(g => g.Id == l.GroupId);
                    var current_user = context.User.SingleOrDefault(u => u.Id == l.UserId);
                    var user_group = context.GroupUsers.SingleOrDefault(gu => gu.GroupId == group.Id && gu.UserId == current_user.Id);

                    if (group == null || current_user == null || user_group == null) return;
                    //ids before removing
                    List<int> UserIds = group.UserIds;
                    context.GroupUsers.Remove(user_group);
                    context.SaveChanges();
          
                    foreach(int user_id in UserIds)
                    {
                        var client = clients.SingleOrDefault(c => ((ChatRoomSocket)c).id == user_id);
                        if (client != null) client.Send(message);
                    }
                    break;
            }
        }
    }
    class ChatRoomEvent
    {
        public string Type { get; set; }
        public Message ChatMessage { get; set; }
        public int OpenChatBoxId { get; set; }
        public int Connected { get; set; }
        public int DisConnected { get; set; }
        public Group GroupCreated { get; set; }

        public GroupEdited GroupEdited { get; set; }
        public LeavingGroup LeavingGroup { get; set; }

        public ReadMessages ReadMessages { get; set; }
        public Typing Typing { get; set; }
    }

    public class ReadMessages
    {
        public int FromId { set; get; }
        public int ToId { set; get; }
        public string Type { set; get; }
    }
    public class Typing
    {
        public int ClientId { set; get; }
        public string Type { set; get; }
        public int FromId { set; get; }
    }
    public class LeavingGroup
    {
        public int UserId { set; get; }
        public int GroupId { set; get; }
    }
    public class GroupEdited
    {
        public int Id { set; get; }
        public string Name { set; get; }
        public List<int> UserIds{ set; get; }
    }
}