using Microsoft.Web.WebSockets;
using MyChatRoom.Models;
using MySocketClass;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;

namespace MyChatRoom.Controllers
{
    public class HomeController : Controller
    {

        public ActionResult Index(string showError)
        {

            if (Session["AuthID"] != null && Request.Cookies["AuthID"] != null && Request.Cookies["AuthID"].Value == Session["AuthID"].ToString())
            {
                return RedirectToAction("ConnectedUsersAngular");
            }
            ViewBag.showError = showError;
            return View();
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
        [HttpPost]
        public ActionResult Login(string Email, string Password)
        {
            var context = new MyChatRoomEntities1();
            if(context.User.SingleOrDefault(u => u.Name == Email && u.Password == Password) != null)
            {
                string authId = Guid.NewGuid().ToString();
                Session["AuthID"] = authId;
                Session["Username"] = Email;
                Session["UserId"] = context.User.SingleOrDefault(u => u.Name == Email && u.Password == Password).Id;
                var cookie = new HttpCookie("AuthID");
                cookie.Value = authId;
                Response.Cookies.Add(cookie);
                return RedirectToAction("ConnectedUsersAngular");
            }
            ViewBag.showError = "show";
            return RedirectToAction("Index", new { showError="show" });
        }
        public ActionResult ConnectedUsers()
        {
            if (Session["AuthID"] == null || Request.Cookies["AuthID"] == null || Request.Cookies["AuthID"].Value != Session["AuthID"].ToString())
            {
                return RedirectToAction("index", new { showerror = "" });
            }
            var context = new MyChatRoomEntities1();
            var users = context.User;
            return View(users);
        }
        public ActionResult ConnectedUsersAngular()
        {
            if (Session["AuthID"] == null || Request.Cookies["AuthID"] == null || Request.Cookies["AuthID"].Value != Session["AuthID"].ToString())
            {
                return RedirectToAction("index", new { showerror = "" });
            }
           
            return View();
        }


        public void StartChat()
        {
            if (HttpContext.IsWebSocketRequest)
            {
                HttpContext.AcceptWebSocketRequest(new ChatRoomSocket());
            }
        } 
    }
}