using Microsoft.AspNetCore.Mvc;

namespace Minesweeper.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
