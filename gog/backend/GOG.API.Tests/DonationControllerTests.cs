using Microsoft.VisualStudio.TestTools.UnitTesting;
using Microsoft.EntityFrameworkCore;
using GOG.API.Data;
using GOG.API.Controllers;
using GOG.API.Models;
using GOG.API.DTOs;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Linq;

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
    
}