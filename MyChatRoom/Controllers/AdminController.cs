using MyChatRoom.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace MyChatRoom.Controllers
{
    public class AdminController : Controller
    {
        MyChatRoomEntities1 context = new MyChatRoomEntities1();
        // GET: Admin
        public ActionResult Index()
        {
            if (Session["AuthID"] == null || Request.Cookies["AuthID"] == null || Request.Cookies["AuthID"].Value != Session["AuthID"].ToString())
            {
                return RedirectToAction("index", "Home", new { showerror = "" });
            }
            int user_id = Convert.ToInt32(Session["UserId"]);
            var user = context.User.SingleOrDefault(u => u.Id == user_id);
            if (user != null)
            {
                var user_role = user.Role;
                if (user_role == 1)
                {
                    return View(context.User);
                }
                else
                {
                    return RedirectToAction("index", "Home", new { showerror = "" });
                }
            }
            else
            {
                return RedirectToAction("index", "Home", new { showerror = "" });
            }
        }
        [HttpPost]
        public string Edit(int id, string Name, int Role)
        {
            var user = context.User.SingleOrDefault(u => u.Id == id);
            if(user!=null)
            {
                user.Name = Name;
                user.Role = Role;
                context.SaveChanges();
                return "ok";
            }
            return "id not exist";
        }
    }
}