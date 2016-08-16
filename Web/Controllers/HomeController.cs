using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace Web.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index(string uid, string csid, string pid)
        {
            return View(new {
                uid = uid,
                csid = csid,
                pid = pid
            });
        }
    }
}
