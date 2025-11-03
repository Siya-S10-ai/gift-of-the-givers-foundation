using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using GOG.API.Models;
using GOG.API.Services;
using GOG.API.DTOs;
using Task = System.Threading.Tasks.Task;
using System.Threading;
using System.Data;

namespace GOG.API.Tests
{
    [TestClass]
    public class AuthControllerTests
    {
        // private Mock<UserManager<ApplicationUser>> _userManagerMock!;
        // private Mock<SignInManager<ApplicationUser>> _signInManagerMock!;
        // private Mock<IJwtService> _jwtServiceMock!;
        private Mock<GOG.API.Data.ApplicationDbContext> _dbContextMock = null!;
        private Mock<UserManager<ApplicationUser>> _userManagerMock = null!;
        private Mock<SignInManager<ApplicationUser>> _signInManagerMock = null!;
        private Mock<IJwtService> _jwt_serviceMock = null!;
        [TestInitialize]
        public void Setup()
        {
            _userManagerMock = TestHelpers.IdentityMocks.MockUserManager<ApplicationUser>();
            _signInManagerMock = TestHelpers.IdentityMocks.MockSignInManager<ApplicationUser>(_userManagerMock);
            _jwtServiceMock = new Mock<IJwtService>();
            _dbContextMock = new Mock<GOG.API.Data.ApplicationDbContext>();
        }

        [TestMethod]
        public async Task Register_ReturnsOk_WithToken_OnSucccess()
        {
            //Arrange
            var registerDto = new RegisterDto { Email = "a@b.com", Username = "Siya", Password = "Password1234!", Role = "Volunteer" };

            _userManagerMock.Setup(x => x.FindByEmailAsync(registerDto.Email)).ReturnsAsync((ApplicationUser?)null);
            _userManagerMock.Setup(x => x.CreateAsync(It.IsAny<ApplicationUser>(), registerDto.Password))
                .ReturnsAsync(IdentityResult.Success)
                .Callback<ApplicationUser, string>((u, p) => u.Id = "test-id");
            _userManagerMock.Setup(x => x.AddToRoleAsync(It.IsAny<ApplicationUser>(), registerDto.Role))
                .ReturnsAsync(IdentityResult.Success);
                
            _jwtServiceMock.Setup(j => j.GenerateToken(It.IsAny<ApplicationUser>())).Returns("fake-token");

            var controller = new GOG.API.Controllers.AuthController(
                _userManagerMock.Object,
                _signInManagerMock.Object,
                _jwtServiceMock.Object,
                _dbContextMock.Object);

            // Act
            var actionResult = await controller.Register(registerDto);
            var ok = actionResult.Result as OkObjectResult;

            // Assert
            Assert.IsNotNull(ok);
            var body = ok!.Value as AuthResponseDto;
            Assert.IsNotNull(body);
            Assert.AreEqual("fake-token", body!.Token);
            Assert.AreEqual("test-id", body.UserId);
        }

        [TestMethod]
        public async Task Login_ReturnsUnauthorized_OnInvalidCredentials()
        {
            // Arrange
            var loginDto = new LoginDto { Email = "notfound@b.com", Password = "bad" };

            _userManagerMock.Setup(x => x.FindByEmailAsync(loginDto.Email)).ReturnsAsync((ApplicationUser?)null);

            var controller = new GOG.API.Controllers.AuthController(
                _userManagerMock.Object,
                _signInManagerMock.Object,
                _jwtServiceMock.Object,
                _dbContextMock.Object);

            // Act
            var result = await controller.Login(loginDto);

            // Assert
            Assert.IsInstanceOfType(result.Result, typeof(UnauthorizedObjectResult));
        }

        [TestMethod]
        public async Task Login_ReturnsOk_WithToken_OnSuccess()
        {
            var loginDto = new LoginDto { Email = "a@b.com", Password = "GoodPass" };
            var user = new ApplicationUser { Id = "uid", Email = loginDto.Email, UserName = "u1" };

            _userManagerMock.Setup(x => x.FindByEmailAsync(loginDto.Email)).ReturnsAsync(user);
            _signInManagerMock.Setup(s => s.CheckPasswordSignInAsync(user, loginDto.Password, false))
                .ReturnsAsync(Microsoft.AspNetCore.Identity.SignInResult.Success);

            _jwtServiceMock.Setup(j => j.GenerateToken(user)).Returns("jwt-token");

            var controller = new GOG.API.Controllers.AuthController(
                _userManagerMock.Object,
                _signInManagerMock.Object,
                _jwtServiceMock.Object,
                _dbContextMock.Object);

            var actionResult = await controller.Login(loginDto);
            var ok = actionResult.Result as OkObjectResult;
            Assert.IsNotNull(ok);
            var body = ok!.Value as AuthResponseDto;
            Assert.IsNotNull(body);
            Assert.AreEqual("jwt-token", body!.Token);
            Assert.AreEqual("uid", body.UserId);
        }
    }
}
