using Microsoft.AspNetCore.Mvc;
using Minesweeper.Helpers;
using Minesweeper.Models;
using Newtonsoft.Json;

namespace Minesweeper.Controllers
{
	public class HomeController : Controller
	{
		public IActionResult Index()
		{
			return View();
		}

		[HttpPost("/initialization")]
		public JsonResult Init([FromBody] Object model)
		{
			var gameParams = JsonHelper.DeserializeObject<GameParameters>(model);

			if (gameParams == null)
			{
				return Json(new { success = false });
			}

			Game.ResetGameProgress(HttpContext);
			var gameField = Game.CreateField(gameParams);
			Game.SaveGameInitialState(gameField, gameParams, HttpContext);

			return Json(new { success = true, empty = true });
		}

		[HttpPost("/checkCell")]
		public JsonResult RevealCell([FromBody] Object model)
		{
			var coordinates = JsonHelper.DeserializeObject<Coordinates>(model);

			if (coordinates == null)
			{
				return Json(new { success = false }); 
			}

			var gameField = JsonHelper.DeserializeFromSession<Cell[,]>("GameField", HttpContext)!;
			var gameParams = JsonHelper.DeserializeFromSession<GameParameters>("InitialParameters", HttpContext);
			var gameProgress = JsonHelper.DeserializeFromSession<GameProgress>("GameProgress", HttpContext);

			if (gameProgress == null)
			{
				gameProgress = new GameProgress
				{
					Cells = new List<Cell>()
				};
			}

			if (gameProgress.IsGameOver)
			{
				return Json(new { success = false });
			}

			var result = Game.ChangeGameProgress(gameProgress, gameField, coordinates);
			gameProgress.Time = Game.GetPassedTime(gameParams!.InitialTime);
			gameProgress.IsGameOver = Game.CheckIfGameOver(gameProgress, gameParams);
			Game.SaveGameProgress(gameProgress, HttpContext);

			return Json(new 
			{ 
				response = JsonConvert.SerializeObject(new 
				{ 
					Cells = result,
					gameProgress.IsGameOver,
					gameProgress.IsExplosion,
					gameProgress.Time,
				}), 
				success = true 
			});
		}
	}
}
