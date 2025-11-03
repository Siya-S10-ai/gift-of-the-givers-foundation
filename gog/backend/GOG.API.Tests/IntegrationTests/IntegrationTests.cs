using Microsoft.VisualStudio.TestTools.UnitTesting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using GOG.API;
using GOG.API.Data;
using GOG.API.Controllers;
using GOG.API.DTOs;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Linq;
using System;

namespace GOG.API.Tests.IntegrationTests
{
    [TestClass]
    public class IntegrationTests
    {
        private WebApplicationFactory<Program>? _factory;
        private SqliteConnection? _connection;

        [TestInitialize]
        public void Init()
        {
            // Create an in-memory Sqlite connection that lives for the duration of the test class instance
            _connection = new SqliteConnection("DataSource=:memory:");
            _connection.Open();

            _factory = new WebApplicationFactory<Program>()
                .WithWebHostBuilder(builder =>
                {
                    builder.ConfigureServices(services =>
                    {
                        // Remove existing ApplicationDbContext registration
                        var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
                        if (descriptor != null) services.Remove(descriptor);

                        // Add a Sqlite in-memory ApplicationDbContext
                        services.AddDbContext<ApplicationDbContext>(options =>
                        {
                            options.UseSqlite(_connection);
                        });

                        // Build provider and ensure database is created
                        var sp = services.BuildServiceProvider();
                        using var scope = sp.CreateScope();
                        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                        db.Database.EnsureCreated();
                    });
                });
        }

        [TestCleanup]
        public void Cleanup()
        {
            _connection?.Close();
            _connection?.Dispose();
            _factory?.Dispose();
        }

        [TestMethod]
        public async Task Donations_CreateAndGet_Works_EndToEndLike()
        {
            using var scope = _factory!.Services.CreateScope();
            var services = scope.ServiceProvider;

            var db = services.GetRequiredService<ApplicationDbContext>();

            // Create controller instance from real DI
            var controller = new DonationsController(db);

            // prepare a fake User claim for the controller (controller reads User.FindFirst("UserId"))
            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim("UserId", "integration-user"),
                new Claim("Username", "integration")
            }, "TestAuth"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            // Create donation DTO
            var createDto = new CreateDonationDto
            {
                Category = "General",
                Amount = 9.99m,
                TransactionReference = "tx-int-1",
                DonorName = "Integration Tester"
            };

            // Call controller method
            var actionResult = await controller.CreateDonation(createDto);
            var created = actionResult.Result as CreatedAtActionResult;
            Assert.IsNotNull(created);

            // Verify DB
            var saved = db.Donations.FirstOrDefault(d => d.TransactionReference == "tx-int-1");
            Assert.IsNotNull(saved);
            Assert.AreEqual(9.99m, saved!.Amount);
            Assert.AreEqual("integration-user", saved.UserId);

            // Test GetDonations returns at least the created item
            var getResult = await controller.GetDonations() as OkObjectResult;
            Assert.IsNotNull(getResult);
            var list = getResult!.Value as System.Collections.Generic.IEnumerable<DonationDto>;
            Assert.IsNotNull(list);
            Assert.IsTrue(list.Any(d => d.TransactionReference == "tx-int-1"));
        }
    }
}