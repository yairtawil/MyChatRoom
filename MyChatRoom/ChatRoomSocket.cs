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
            var context = new MyChatRoomEntities1();
            var user = context.User.SingleOrDefault(u => u.Id == id);
            user.IsConnect = true;
            context.SaveChanges();
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
                case "OpenChatBoxId":
                    int OpenChatBoxId = e.OpenChatBoxId;
                    var me = clients.SingleOrDefault(u => ((ChatRoomSocket)u).id == id);
                    var unreadMsgs = context.Message.Where(m => (m.from_id == OpenChatBoxId && m.to_id == id && !m.read) || (m.from_id == id && m.to_id == OpenChatBoxId && !m.read));
                    foreach(Message msg in unreadMsgs)
                    {
                        msg.read = true;
                    }
                    context.SaveChanges();
                    me.Send(serializer.Serialize(new {
                        Type = "OpenChatBox",
                        OpenChatBox = new  {
                            chatBoxId = OpenChatBoxId,
                            userMessages = unreadMsgs.Select(m => new
                            {
                                Id = m.Id
                            }).ToList(),
                        }
                    }));
                    break;
            }
        }
    }
    class ChatRoomEvent
    {
        public string Type { get; set; }
        public Message ChatMessage { get; set; }
        public int OpenChatBoxId { get; set; } 

    }
}
