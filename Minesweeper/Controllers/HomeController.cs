using Microsoft.AspNetCore.Mvc;
using Minesweeper.Models;
using Newtonsoft.Json;

namespace Minesweeper.Controllers
{
    public class HomeController : Controller
    {
		public const string SessionKeyName = "_Name";
		public const string SessionKeyAge = "_Age";

		public IActionResult Index()
        {
            return View();
        }

        [HttpPost("/initialization")]
        public JsonResult Init([FromBody] Object model)
        {
			var data = JsonConvert.DeserializeObject<GameParameters>(model?.ToString() ?? String.Empty);

			if (data == null)
			{
				return Json(new { success = false }); // Return 400 Bad Request if model is null
			}

			if (string.IsNullOrEmpty(HttpContext.Session.GetString(SessionKeyName)))
			{
				HttpContext.Session.SetString(SessionKeyName, "The Doctor");
				HttpContext.Session.SetInt32(SessionKeyAge, 73);
			}
			var name = HttpContext.Session.GetString(SessionKeyName);
			var age = HttpContext.Session.GetInt32(SessionKeyAge).ToString();




			return Json(new { success = true });
        }
    }
}
