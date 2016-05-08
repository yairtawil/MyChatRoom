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
                    Message mes_obj = e.ChatMessage;
                    context.Message.Add(mes_obj);
                    context.SaveChanges();
                    ChatRoomEvent s = new ChatRoomEvent();

                    var client_to = clients.SingleOrDefault(c => ((ChatRoomSocket)c).id == mes_obj.to_id);
                    var client_from = clients.SingleOrDefault(c => ((ChatRoomSocket)c).id == mes_obj.from_id);

                    client_to.Send(serializer.Serialize(e));
                    client_from.Send(serializer.Serialize(e));
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
    }
}
