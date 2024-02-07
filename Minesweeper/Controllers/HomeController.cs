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
			var gameParams = JsonConvert.DeserializeObject<GameParameters>(model?.ToString() ?? String.Empty);

			if (gameParams == null)
			{
				return Json(new { success = false });
			}

			this.ResetGameProgress();

			var gameField = this.CreateField(gameParams);
			this.SaveGameInitialState(gameField, gameParams);

			return Json(new { success = true, empty = true });
		}

		private void ResetGameProgress()
		{
			HttpContext.Session.Remove("GameField");
			HttpContext.Session.Remove("InitialParameters");
			HttpContext.Session.Remove("GameProgress");
		}

		[HttpPost("/checkCell")]
		public JsonResult RevealCell([FromBody] Object model)
		{
			var coordinates = JsonConvert.DeserializeObject<Coordinates>(model?.ToString() ?? String.Empty);

			if (coordinates == null)
			{
				return Json(new { success = false }); 
			}

			string jsonGameField = HttpContext.Session.GetString("GameField")!;
			var gameField = JsonConvert.DeserializeObject<Cell[,]>(jsonGameField ?? String.Empty)!;

			string gameParamsJson = HttpContext.Session.GetString("InitialParameters")!;
			var gameParams = JsonConvert.DeserializeObject<GameParameters>(gameParamsJson?.ToString() ?? String.Empty);

			string? gameProgressJson = HttpContext.Session.GetString("GameProgress");
			var gameProgress = JsonConvert.DeserializeObject<GameProgress>(gameProgressJson?.ToString() ?? String.Empty);

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

			var result = ChangeGameProgress(gameProgress, gameField, coordinates);

			//List<Cell> result;
			//var isExplosion = false;
			//var isGameOver = false;

			/*if (gameField[coordinates.X, coordinates.Y].IsMine == true)
			{
				result = gameField.Cast<Cell>().Where(cell => cell.IsMine == true).ToList();
				isExplosion = true;
				isGameOver = true;
			}
			else if (gameField[coordinates.X, coordinates.Y].IsMine == false && gameField[coordinates.X, coordinates.Y].MinesAround != 0)
			{
				result = new List<Cell>
				{
					gameField[coordinates.X, coordinates.Y]
				};
			}
			else
			{
				result = new List<Cell>();
				result = RevealEmptyCells(coordinates, gameField, result);
			}*/


			//var seconds = DateTime.Now - gameParams!.InitialTime;.seconds

			///////save state
			gameProgress.Time = (DateTime.Now - gameParams!.InitialTime).Seconds;
			
			if (gameProgress.Cells.Count == gameParams.FieldSize * gameParams.FieldSize - gameParams.MineNumber)
			{
				gameProgress.IsGameOver = true;
			}

			this.SaveGameProgress(gameProgress);


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

		private List<Cell> ChangeGameProgress(GameProgress gameProgress, Cell[,] gameField, Coordinates coordinates)
		{
			List<Cell> result;

			if (gameField[coordinates.X, coordinates.Y].IsMine == true)
			{
				result = gameField.Cast<Cell>().Where(cell => cell.IsMine == true).ToList();
				gameProgress.IsExplosion = true;
				gameProgress.IsGameOver = true;
			}
			else if (gameField[coordinates.X, coordinates.Y].IsMine == false && gameField[coordinates.X, coordinates.Y].MinesAround != 0)
			{
				result = new List<Cell>
				{
					gameField[coordinates.X, coordinates.Y]
				};
			}
			else
			{
				result = new List<Cell>();
				result = RevealEmptyCells(coordinates, gameField, result);
			}

			gameProgress.Cells = gameProgress.Cells.Union(result).ToList(); // Combine without duplicates

			return result;
		}



		private List<Cell> RevealEmptyCells(Coordinates point, Cell[,] field, List<Cell> result)
		{
			for (int col = Math.Max(0, point.X - 1); col <= Math.Min(field.GetLength(0) - 1, point.X + 1); ++col)
			{
				for (int row = Math.Max(0, point.Y - 1); row <= Math.Min(field.GetLength(1) - 1, point.Y + 1); ++row)
				{
					if (!result.Contains(field[col, row]) && field[col, row].IsMine == false) {
						result.Add(field[col, row]);

						if (field[col, row].MinesAround == 0)
						{
							Coordinates coordinates = new Coordinates { X = col, Y = row };
							RevealEmptyCells(coordinates, field, result);
						}
					}			
				}
			}

			return result;
		}

		private Cell[,] SetAroundMinesCount(Cell[,] field)
		{
			for (int i = 0; i < field.GetLength(0); ++i)
			{
				for (int j = 0; j < field.GetLength(1); ++j)
				{
					if (!field[i, j].IsMine)
					{
						field = GetMinesAround(field, i, j);
					}
				}
			}				

			return field;
		}

		private Cell[,] GetMinesAround(Cell[,] field, int i, int j)
		{
			for (int col = Math.Max(0, i - 1); col <= Math.Min(field.GetLength(0) - 1, i + 1); ++col)
			{
				for (int row = Math.Max(0, j - 1); row <= Math.Min(field.GetLength(1) - 1, j + 1); ++row)
				{
					if (field[col, row].IsMine)
					{
						field[i, j].MinesAround++;
					}
				}
			}

			return field;
		}

		private Cell[,] GenerateMines(Cell[,] field, int mines)
		{
			var assignedMines = 0;
			var random = new Random();

			while (assignedMines < mines)
			{
				var col = random.Next(random.Next(0, field.GetLength(0)));
				var row = random.Next(random.Next(0, field.GetLength(1)));

				if (!field[col,row].IsMine)
				{
					field[col, row].IsMine = true;
					++assignedMines;
				}
			}

			return field;
		}

		private void SaveGameInitialState(Cell[,] gameField, GameParameters gameParams)
		{
			string fieldJson = JsonConvert.SerializeObject(
									gameField,
									Formatting.None,
									new JsonSerializerSettings
									{
										NullValueHandling = NullValueHandling.Ignore,
										Formatting = Formatting.Indented
									});

			string gameParamsJson = JsonConvert.SerializeObject(
									gameParams,
									Formatting.None,
									new JsonSerializerSettings
									{
										NullValueHandling = NullValueHandling.Ignore,
										Formatting = Formatting.Indented
									});

			HttpContext.Session.SetString("GameField", fieldJson);
			HttpContext.Session.SetString("InitialParameters", gameParamsJson);
		}

		private void SaveGameProgress(GameProgress gameProgress)
		{
			string gameProgressJson = JsonConvert.SerializeObject(
						gameProgress,
						Formatting.None,
						new JsonSerializerSettings
						{
							NullValueHandling = NullValueHandling.Ignore,
							Formatting = Formatting.Indented
						});

			HttpContext.Session.SetString("GameProgress", gameProgressJson);
		}

		private Cell[,] CreateField(GameParameters initParams)
		{
			var gamefield = new Cell[initParams.FieldSize, initParams.FieldSize];

			for (int i = 0; i < initParams.FieldSize; ++i)
			{
				for (int j = 0; j < initParams.FieldSize; ++j)
				{
					gamefield[i, j] = new Cell { Column = i, Row = j };
				}
			}

			this.GenerateMines(gamefield, initParams.MineNumber);
			this.SetAroundMinesCount(gamefield);

			return gamefield;
		}
	}
}
