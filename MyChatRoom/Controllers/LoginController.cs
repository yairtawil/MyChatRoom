using MyChatRoom.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace MyChatRoom.Controllers
{
    public class LoginController : Controller
    {
        // GET: Login
        public ActionResult Index(string showError)
        {
            if (Session["AuthID"] != null && Request.Cookies["AuthID"] != null && Request.Cookies["AuthID"].Value == Session["AuthID"].ToString())
            {
                ViewBag.MESSAGES_COUNT = MessageController.MESSAGES_COUNT;
                return RedirectToAction("index", "Home", null);
            }
            ViewBag.showError = showError;
            return View();
        }

        [HttpPost]
        public ActionResult Login(string Email, string Password)
        {
            var context = new MyChatRoomEntities1();
            if (context.User.SingleOrDefault(u => u.Name == Email && u.Password == Password) != null)
            {
                string authId = Guid.NewGuid().ToString();
                Session["AuthID"] = authId;
                Session["Username"] = Email;
                Session["UserId"] = context.User.SingleOrDefault(u => u.Name == Email && u.Password == Password).Id;
                Session["Role"] = context.User.SingleOrDefault(u => u.Name == Email && u.Password == Password).Role;
                var cookie = new HttpCookie("AuthID");
                cookie.Value = authId;
                Response.Cookies.Add(cookie);
                return RedirectToAction("index", "Home", null);
            }
            ViewBag.showError = "show";
            return RedirectToAction("Index", new { showError = "show" });
        }

        [HttpGet]
        public ActionResult Logout()
        {
            HttpCookie myCookie = new HttpCookie("AuthID");
            myCookie.Expires = DateTime.Now.AddDays(-1d);
            Response.Cookies.Add(myCookie);
            Session["AuthID"] = null;
            Session["Username"] = null;
            Session["UserId"] = null;

            return RedirectToAction("index", new { showerror = "" });
        }
    }
}