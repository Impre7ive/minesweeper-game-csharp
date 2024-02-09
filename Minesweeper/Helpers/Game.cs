using Minesweeper.Models;
using Newtonsoft.Json;

namespace Minesweeper.Helpers
{
	public static class Game
	{
		public static int GetPassedTime(DateTime initialTime)
		{
			return (DateTime.Now - initialTime).Seconds;
		}

		public static bool CheckIfGameOver(GameProgress gameProgress, GameParameters gameParams)
		{
			if (gameProgress.Cells.Count == gameParams.FieldSize * gameParams.FieldSize - gameParams.MineNumber)
			{
				return true;
			}

			return false;
		}

		public static void ResetGameProgress(HttpContext context)
		{
			context.Session.Remove("GameField");
			context.Session.Remove("InitialParameters");
			context.Session.Remove("GameProgress");
		}

		public static List<Cell> ChangeGameProgress(GameProgress gameProgress, Cell[,] gameField, Coordinates coordinates)
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

			gameProgress.Cells = gameProgress.Cells.Union(result).ToList(); 

			return result;
		}

		private static List<Cell> RevealEmptyCells(Coordinates point, Cell[,] field, List<Cell> result)
		{
			for (int col = Math.Max(0, point.X - 1); col <= Math.Min(field.GetLength(0) - 1, point.X + 1); ++col)
			{
				for (int row = Math.Max(0, point.Y - 1); row <= Math.Min(field.GetLength(1) - 1, point.Y + 1); ++row)
				{
					if (!result.Contains(field[col, row]) && field[col, row].IsMine == false)
					{
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

		private static Cell[,] SetAroundMinesCount(Cell[,] field)
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

		private static Cell[,] GetMinesAround(Cell[,] field, int i, int j)
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

		private static Cell[,] GenerateMines(Cell[,] field, int mines)
		{
			var assignedMines = 0;
			var random = new Random();

			while (assignedMines < mines)
			{
				var col = random.Next(random.Next(0, field.GetLength(0)));
				var row = random.Next(random.Next(0, field.GetLength(1)));

				if (!field[col, row].IsMine)
				{
					field[col, row].IsMine = true;
					++assignedMines;
				}
			}

			return field;
		}

		public static void SaveGameInitialState(Cell[,] gameField, GameParameters gameParams, HttpContext context)
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

			context.Session.SetString("GameField", fieldJson);
			context.Session.SetString("InitialParameters", gameParamsJson);
		}

		public static void SaveGameProgress(GameProgress gameProgress, HttpContext context)
		{
			string gameProgressJson = JsonConvert.SerializeObject(
						gameProgress,
						Formatting.None,
						new JsonSerializerSettings
						{
							NullValueHandling = NullValueHandling.Ignore,
							Formatting = Formatting.Indented
						});

			context.Session.SetString("GameProgress", gameProgressJson);
		}

		public static Cell[,] CreateField(GameParameters initParams)
		{
			var gamefield = new Cell[initParams.FieldSize, initParams.FieldSize];

			for (int i = 0; i < initParams.FieldSize; ++i)
			{
				for (int j = 0; j < initParams.FieldSize; ++j)
				{
					gamefield[i, j] = new Cell { Column = i, Row = j };
				}
			}

			GenerateMines(gamefield, initParams.MineNumber);
			SetAroundMinesCount(gamefield);

			return gamefield;
		}
	}
}
