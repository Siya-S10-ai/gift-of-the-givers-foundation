using Microsoft.VisualStudio.TestTools.UnitTesting;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;
using GOG.API.Data;
using GOG.API.Models;
using GOG.API.DTOs;
using GOG.API.Controllers;
using Task = System.Threading.Tasks.Task;

namespace GOG.API.Tests
{
    [TestClass]
    public class DonationsControllerTests
    {
        private ApplicationDbContext CreateContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: $"TestDb_{System.Guid.NewGuid()}")
                .Options;
            return new ApplicationDbContext(options);
        }

        [TestMethod]
        public async Task CreateDonation_PersistsToDatabase()
        {
            // Arrange
            var context = CreateContext();
            var controller = new DonationsController(context);

            var createDto = new CreateDonationDto { Amount = 100m, DonorName = "Thandi" };

            var result = await controller.CreateDonation(createDto) as CreatedAtActionResult;

            var saved = context.Donations.FirstOrDefault();

            // Verify persisted to DB
            // Assert
            Assert.IsNotNull(saved, "Donation not saved in DB");
            Assert.AreEqual(100m, saved!.Amount);
            Assert.AreEqual("Thandi", saved.DonorName);
        }

        [TestMethod]
        public async Task GetDonations_ReturnsList()
        {
            var context = CreateContext();
            context.Donations.Add(new Donation { Amount = 50m, DonorName = "Sipho" });
            context.Donations.Add(new Donation { Amount = 75m, DonaitonName = "Jabu"});
            await context.SaveChangesAsync();

            var controller = new DonationsController(context);
            var ok = await controller.GetDonations() as OkObjectResult;
            Assert.IsNotNull(ok);
            var list = ok!.Value as System.Collections.Generic.IEnumerable<DonationDto>;
            Assert.IsNotNull(list);
            Assert.AreEqual(2, list!.Count());
        }
    }
}