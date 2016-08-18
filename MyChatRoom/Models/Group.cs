//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace MyChatRoom.Models
{
    using Controllers;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    public partial class Group
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public List<int> UserIds
        {
            set
            {
                UserIds = value;
            }
            get
            {
                List<int> users = new List<int>();
                var context = new MyChatRoomEntities1();
                foreach (var group_user in context.GroupUsers.Where(gu => gu.GroupId == this.Id)){
                    users.Add(group_user.UserId);
                };
                return users;
            }
        }
        public int AdminId
        {
            set
            {
                AdminId = value;
            }
            get
            {
                var context = new MyChatRoomEntities1();
                var adminUser = context.GroupUsers.SingleOrDefault(gu => gu.GroupId == this.Id && gu.IsAdmin == true);
                return adminUser == null ? -1 : adminUser.UserId;
            }
        }
        public List<Message> Message
        {
            set
            {
                Message = value;
            }
            get
            {
                var context = new MyChatRoomEntities1();
                return context.Message.OrderByDescending(msg => msg.Id).Take(MessageController.MESSAGES_COUNT).OrderBy(msg => msg.Id).Where(m => m.group_id == this.Id).ToList();
            }
        }
    }
}
