using Microsoft.AspNetCore.Mvc;
using System.Text;

namespace VendistaTest.Controllers
{
    public class HomeController : Controller
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public HomeController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        public IActionResult Index() => View();

        [HttpGet]
        public async Task<IActionResult> GetCommands(string token)
        {
            string apiUrl = $"{_configuration["ApiURL"]}/commands/types?token={token}";
            var client = _httpClientFactory.CreateClient();

            try
            {
                var response = await client.GetAsync(apiUrl);
                string result = await response.Content.ReadAsStringAsync();
                return Content(result, "application/json");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }

            return Content(null);
        }

        [HttpGet]
        public async Task<IActionResult> GetTerminalCommands(string id, string token)
        {
            string apiUrl = $"{_configuration["ApiURL"]}/terminals/{id}/commands?OrderDesc=true&token={token}";
            var client = _httpClientFactory.CreateClient();

            try
            {
                var response = await client.GetAsync(apiUrl);
                string result = await response.Content.ReadAsStringAsync();
                return Content(result, "application/json");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }

            return Content(null);
        }

        [HttpPost]
        public async Task<IActionResult> PostTerminalCommand(string id, string token)
        {
            string apiUrl = $"{_configuration["ApiURL"]}/terminals/{id}/commands?token={token}";
            var client = _httpClientFactory.CreateClient();

            try
            {
                using (var reader = new StreamReader(Request.Body))
                {
                    var json = await reader.ReadToEndAsync();
                    var response = await client.PostAsync(apiUrl, new StringContent(json, Encoding.UTF8, "application/json"));
                    string result = await response.Content.ReadAsStringAsync();
                    return Content(result, "application/json");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }

            return Content(null);
        }
    }
}