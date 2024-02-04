using System.Text.Json.Serialization;

namespace Minesweeper.Models
{
	public class GameParameters
	{
		[JsonPropertyName("Timestamp")]
		public DateTime InitialTime { get; set; }
		public int FieldSize { get; set; }
		public int MineNumber { get; set; }

	}
}
