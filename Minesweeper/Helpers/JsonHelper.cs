using Minesweeper.Models;
using Newtonsoft.Json;
using System.Reflection;

namespace Minesweeper.Helpers
{
	public static class JsonHelper
	{
		public static T? DeserializeFromSession<T>(string sessionKey, HttpContext context)
		{
			var jsonString = context.Session.GetString(sessionKey);

			return JsonConvert.DeserializeObject<T>(jsonString ?? String.Empty);
		}

		public static T? DeserializeObject<T>(Object model)
		{
			return JsonConvert.DeserializeObject<T>(model?.ToString() ?? String.Empty);
		}
	}
}
