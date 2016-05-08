using MyChatRoom.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Script.Serialization;

namespace MyChatRoom.Controllers
{
    public class UserController : ApiController
    {
        public string Get(int my_id)
        {
            var context = new MyChatRoomEntities1();
            var users = context.User.Where(u => u.Id != my_id).Select(e => new {
                Id = e.Id,
                Name = e.Name,
                IsConnect = e.IsConnect,
                Message = context.Message.Where(m => (m.from_id == e.Id && m.to_id == my_id) || (m.from_id == my_id && m.to_id == e.Id)).Select(m => new
                {
                    Id = m.Id,
                    from_id = m.from_id,
                    to_id = m.to_id,
                    read = m.read,
                    text = m.text
                }),
            }).ToList();
            return new JavaScriptSerializer().Serialize(users);
        }
        
    }
}
