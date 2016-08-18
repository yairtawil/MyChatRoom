using Microsoft.Web.WebSockets;
using MyChatRoom.Models;
using MySocketClass;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Script.Serialization;

namespace MyChatRoom.Controllers
{
    public class GroupController : Controller
    {
        [System.Web.Http.HttpPost]
        public void CreateGroup(int adminId, string name, List<Int32> users)
        {
            JavaScriptSerializer serializer = new JavaScriptSerializer();
            var context = new MyChatRoomEntities1();
            Group newGroup = new Group
            {
                Name = name
            };
            context.Group.Add(newGroup);
            context.SaveChanges();
            context.GroupUsers.Add(new GroupUsers { GroupId = newGroup.Id, UserId = adminId, IsAdmin = true });
            foreach (int user in users)
            {
                context.GroupUsers.Add(new GroupUsers { GroupId = newGroup.Id, UserId = user });
            }
            context.SaveChanges();
            string create_group_event = serializer.Serialize(new MySocketClass.ChatRoomEvent
            {
                Type = "GroupCreated",
                GroupCreated = newGroup
            });
            foreach (int id in newGroup.UserIds)
            {
                var client = MySocketClass.ChatRoomSocket.clients.SingleOrDefault(c=> ((ChatRoomSocket)c).id == id );
                if (client != null) client.Send(create_group_event);
            }

            //return Json(newGroup);
        }
    
        [System.Web.Http.HttpPost]
        public void EditGroup(int adminId, string name, List<Int32> users, int groupId)
        {
            JavaScriptSerializer serializer = new JavaScriptSerializer();
            var context = new MyChatRoomEntities1();
            var selectedGroup = context.Group.SingleOrDefault(g => g.Id == groupId);
            selectedGroup.Name = name;
            context.SaveChanges();
  
            string edit_group_event = serializer.Serialize(new MySocketClass.ChatRoomEvent
            {
                Type = "GroupEdited",
                GroupEdited = new GroupEdited { Id = selectedGroup.Id, Name = selectedGroup.Name, UserIds = selectedGroup.UserIds }
            });
      
            foreach (int id in selectedGroup.UserIds)
            {
                var client = MySocketClass.ChatRoomSocket.clients.SingleOrDefault(c => ((ChatRoomSocket)c).id == id);
                if (client != null) client.Send(edit_group_event);
            }

            //return Json(newGroup);
        }

    }
}
