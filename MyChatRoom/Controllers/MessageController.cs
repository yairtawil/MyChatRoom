using MyChatRoom.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Http.Results;
using System.Web.Mvc;

namespace MyChatRoom.Controllers
{
    public class MessageController : ApiController
    {
        public static int MESSAGES_COUNT = 40;

        [EnableCors(origins: "*", headers: "*", methods: "*")]
        [System.Web.Mvc.ActionName("Post")]
        [System.Web.Mvc.HttpPost]
        [System.Web.Http.AcceptVerbs("GET", "POST")]
        public string Post(int role, int my_id, int chatbox_id, string type)
        {
            var context = new MyChatRoomEntities1();
            
            switch (type)
            {
                case "users":
                    var unreadMsgs = context.Message.Where(m => (m.from_id == chatbox_id && m.to_id == my_id && context.MessageRead.Where(mr => mr.MessageId == m.Id && mr.UserId == m.to_id).Count() == 0));
                    foreach (Message msg in unreadMsgs)
                    {
                        context.MessageRead.Add(new MessageRead { MessageId = msg.Id, UserId = Convert.ToInt32(msg.to_id) });
                    }
                    break;
                case "groups":
                    unreadMsgs = context.Message.Where(m => (m.from_id != my_id && m.group_id == chatbox_id && context.MessageRead.Where(mr => mr.MessageId == m.Id && mr.UserId == my_id).Count() == 0));
                    foreach (Message msg in unreadMsgs)
                    {
                        context.MessageRead.Add(new MessageRead { MessageId = msg.Id, UserId = Convert.ToInt32(my_id) });
                    }
                    break;
            }
            context.SaveChanges();
            return "ok";
        }
        public MsgListWithPage Get(int role, int my_id, int chatbox_id, int Page)
        {
            var context = new MyChatRoomEntities1();
            var messages = context.Message.OrderByDescending(msg => msg.Id).Where(m => (m.from_id == my_id && m.to_id == chatbox_id) || (m.from_id == chatbox_id && m.to_id == my_id)).Skip(MESSAGES_COUNT * Page).Take(MESSAGES_COUNT)
           //.Select(m => new UserController.simpleMsg
           // {
           //     Id = m.Id,
           //     from_id = (int)m.from_id,
           //     to_id = (int)m.to_id,
           //     read = m.read,
           //     text = m.text,
           //     CreateAt = m.CreateAt.ToString()
           // })
            .ToList();
            return new MsgListWithPage
            {
                Page = messages.Count > 0 ? Page + 1 : Page,
                Messages = messages
            };
        }
        public class MsgListWithPage
        {
            public int Page { set; get; }
            public List<Message> Messages {get;set;}
        }
    }
}
