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
        public List<simpleUser> AdminUsers()
        {
            MyChatRoomEntities1 context = new MyChatRoomEntities1();
            return context.User.Select(e => new simpleUser
            {
                Id = e.Id,
                Name = e.Name,
                Role = (int)e.Role,
            }).ToList();
        }
        public List<Group> AdminGroups()
        {
            MyChatRoomEntities1 context = new MyChatRoomEntities1();
            return context.Group.Select(e => new Group
            {
                Id = e.Id,
                Name = e.Name
            }).ToList();
        }
    
        public List<simpleUser> UsersWithMessages(int my_id)
        {
            MyChatRoomEntities1 context = new MyChatRoomEntities1();
            return context.User.Where(u => u.Id != my_id).Select(e => new simpleUser
            {

                Id = e.Id,
                Name = e.Name,
                IsConnect = e.IsConnect,
                Role = (int)e.Role,
                Message = context.Message.OrderByDescending(msg => msg.Id).Where(m => (m.from_id == e.Id && m.to_id == my_id) || (m.from_id == my_id && m.to_id == e.Id)).Take(MessageController.MESSAGES_COUNT).OrderBy(msg => msg.Id).ToList()

            }).ToList();
        }
        public List<Group> GroupsWithMessages(int my_id)
        {
            MyChatRoomEntities1 context = new MyChatRoomEntities1();
            return context.Group.Where(g => context.GroupUsers.Where(gu => gu.GroupId == g.Id && gu.UserId == my_id).Count() != 0).ToList();
        }

        [HttpGet]
        public UsersAndGroups Get(int role, int my_id)
        {

            return role == 1 ? new UsersAndGroups { Users = AdminUsers(), Groups = AdminGroups() } : new UsersAndGroups { Users = UsersWithMessages(my_id) , Groups= GroupsWithMessages(my_id)};
        }

        [HttpDelete]
        public List<simpleUser> Delete(int role, int my_id)
        {
            MyChatRoomEntities1 context = new MyChatRoomEntities1();
            context.User.Remove(context.User.SingleOrDefault(u => u.Id == my_id));
            context.SaveChanges();
            return AdminUsers();
        }
        [HttpPost]
        public List<simpleUser> Create(int role, int my_id, string userName, string userPassword, int userRole)
        {
            MyChatRoomEntities1 context = new MyChatRoomEntities1();
            context.User.Add(new User
            {
                Name = userName,
                Password = userPassword,
                Role = userRole
            });
            context.SaveChanges();
            return AdminUsers();
        }

        public class simpleUser
        {
            public int Id { set; get; }
            public string Name { set; get; }
            public bool IsConnect { set; get; }
            public int Role { set; get; }
            public List<Message> Message { set; get; }
        }
  
        public class UsersAndGroups
        {
            public List<Group> Groups;
            public List<simpleUser> Users;
        }
    }
}
