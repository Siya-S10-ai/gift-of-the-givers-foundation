using Microsoft.VisualStudio.TestTools.UnitTesting;
using Microsoft.EntityFrameworkCore;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Text;
using GOG.API.Data;
using GOG.API.Controllers;
using GOG.API.Services;
using GOG.API.DTOs;
using GOG.API.Models;
using Task = System.Threading.Tasks.Task;

namespace GOG.API.Tests
{
    [TestClass]
    public class IncidentReportsControllerTests
    {
        private ApplicationDbContext CreateContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: $"IRTestDb_{System.Guid.NewGuid()}")
                .Options;
            return new ApplicationDbContext(options);
        }

        [TestMethod]
        public async Task CreateIncidentReport_SavesReport_AndUploadsImage()
        {
            // Arrange
            var context = CreateContext();
            var blobMock = new Mock<IBlobStrorageService>();
            blobMock.Setup(b => b.UploadImageAsync(It.IsAny<IFormFile>(), It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync("https://blob/incident/image.jpg");

            var controller = new IncidentReportsController(context, blobMock.Object);

            // prepare a fake IFormFile
            var content = "hello world";
            var stream = new MemoryStream(Encoding.UTF8.GetBytes(content));
            var formFile = new FormFile(stream, 0, stream.Length, "Image", "img.jpg")
            {
                Headers = new HeaderDictionary(),
                ContentType = "image/jpeg"
            };

            var createDto = new CreateIncidentReportDto
            {
                Description = "desc",
                Location = "loc",
                ReportType = "type",
                Image = formFile
            };

            // need to set a fake User claim for UserId in controller
            var user = new System.Security.Claims.ClaimsPrincipal(
                new System.Security.Claims.ClaimsIdentity(new[]
            {
                new System.Security.Claims.Claim("UserId", "user-123"),
                new System.Security.Claims.Claim("UserName", "Thandi")
            }, "TestAuth"));

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            // Act
            var actionResult = await controller.CreateIncidentReport(createDto);
            var created = actionResult.Result as CreatedAtActionResult;

            // Assert
            Assert.IsNotNull(created);
            var saved = context.IncidentReports.FirstOrDefault();
            Assert.IsNotNull(saved);
            Assert.AreEqual("desc", saved!.Description);
            Assert.AreEqual("user-123", saved.UserId);
            Assert.AreEqual("https://blob/incident/image.jpg", saved.ImageUrl);
            blobMock.Verify(b => b.UploadImageAsync(It.IsAny<IFormFile>(), "incident-images", It.IsAny<string>()), Times.Once);
        }

        [TestMethod]
        public async Task GetIncidentReport_ReturnsNotFound_WhenMissing()
        {
            var context = CreateContext();
            var blobMock = new Mock<IBlobStorageService>();
            var controller = new IncidentReportsController(context, blobMock.Object);

            var result = await controller.GetIncidentReport(999);
            Assert.IsInstanceOfType(result.Result, typeof(NotFoundResult));
        }
    }
}
