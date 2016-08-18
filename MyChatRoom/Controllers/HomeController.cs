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
        public ActionResult index()
        {
            if (Session["AuthID"] == null || Request.Cookies["AuthID"] == null || Request.Cookies["AuthID"].Value != Session["AuthID"].ToString())
            {
                return RedirectToAction("index", "Login", new { showerror = "" });
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