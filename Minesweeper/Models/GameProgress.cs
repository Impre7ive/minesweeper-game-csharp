namespace Minesweeper.Models
{
	public class GameProgress
	{
		public required List<Cell> Cells { get; set; }
		public bool IsGameOver { get; set; }
		public bool IsExplosion { get; set; }
		public int Time { get; set; }
	}
}
