using Microsoft.Web.WebSockets;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MySocketClass
{
    public class ChatRoomSocket : WebSocketHandler
    {
        private static WebSocketCollection clients = new WebSocketCollection();
        public override void OnOpen()
        {
            clients.Add(this);
        }
        public override void OnClose()
        {
        }
        public override void OnMessage(string message)
        {
            var serializer = new JavaScriptSerializer();

            clients.Broadcast(message);
        }
    }
    class Message
    {
        public int form { get; set;}
        public int to { get; set; }
        public string message { get; set; }

    }
}
