namespace Minesweeper.Models
{
	public class Cell
	{
		public int Column { get; set; }
		public int Row { get; set; }
		public bool IsMine { get; set; }
		public int MinesAround { get; set; }
	}
}
