using Newtonsoft.Json;

namespace Minesweeper.Models
{
	public class GameParameters
	{
		[JsonProperty("timestamp")]
		public DateTime InitialTime { get; set; }
		public int FieldSize { get; set; }
		public int MineNumber { get; set; }
	}
}
