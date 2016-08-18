using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;

namespace MyChatRoom
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            config.MapHttpAttributeRoutes();
            //config.EnableCors();
            config.Formatters.Remove(config.Formatters.XmlFormatter);
            //config.Formatters.Add(config.Formatters.JsonFormatter);
            config.Formatters.JsonFormatter.UseDataContractJsonSerializer = true;

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{role}/{my_id}/{chatbox_id}",
                defaults: new { chatbox_id = RouteParameter.Optional }
            );
        }
    }
}
