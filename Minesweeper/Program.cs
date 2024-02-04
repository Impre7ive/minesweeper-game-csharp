namespace Minesweeper
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            builder.Services.AddControllersWithViews()
                            .AddRazorRuntimeCompilation();
			builder.Services.AddSession(options =>
			{
				options.Cookie.Name = "Minesweeper";
				options.IdleTimeout = TimeSpan.FromMinutes(60);
				options.Cookie.IsEssential = true; // rework if cookies are disabled
			});

			var app = builder.Build();
            app.UseStaticFiles();
			app.UseRouting();
			app.UseSession();

			app.MapControllerRoute(
                name: "default",
                pattern: "{controller=Home}/{action=Index}/{id?}");

            app.Run();
        }
    }
}