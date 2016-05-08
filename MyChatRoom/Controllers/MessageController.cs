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
        [EnableCors(origins: "*", headers: "*", methods: "*")]
        [System.Web.Mvc.ActionName("Post")]
        [System.Web.Mvc.HttpPost]
        [System.Web.Http.AcceptVerbs("GET", "POST")]
        public string Post(int my_id, int chatbox_id)
        {
            var context = new MyChatRoomEntities1();
            var unreadMsgs = context.Message.Where(m => (m.from_id == my_id && m.to_id == chatbox_id && m.read == false) || (m.from_id == chatbox_id && m.to_id == my_id && m.read == false));
            foreach(Message msg in unreadMsgs)
            {
                msg.read = true;
            }
            context.SaveChanges();
            return "ok";
        }
    }
}
