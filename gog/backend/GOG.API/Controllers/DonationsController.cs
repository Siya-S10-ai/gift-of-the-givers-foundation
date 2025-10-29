using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GOG.API.Data;
using GOG.API.DTOs;
using GOG.API.Models;

namespace GOG.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DonationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DonationsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DonationDto>>> GetDonations()
        {
            try
            {
                var donations = await _context.Donations
                    .Include(d => d.User)
                    .OrderByDescending(d => d.CreatedAt)
                    .Select(d => new DonationDto
                    {
                        DonationId = d.DonationId,
                        Category = d.Category,
                        Amount = d.Amount,
                        TransactionReference = d.TransactionReference,
                        UserId = d.UserId,
                        CreatedAt = d.CreatedAt,
                        UserName = d.User.UserName ?? string.Empty
                    })
                    .ToListAsync();

                return Ok(donations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DonationDto>> GetDonation(int id)
        {
            try
            {
                var donation = await _context.Donations
                    .Include(d => d.User)
                    .FirstOrDefaultAsync(d => d.DonationId == id);

                if (donation == null)
                {
                    return NotFound();
                }

                var donationDto = new DonationDto
                {
                    DonationId = donation.DonationId,
                    Category = donation.Category,
                    Amount = donation.Amount,
                    TransactionReference = donation.TransactionReference,
                    UserId = donation.UserId,
                    CreatedAt = donation.CreatedAt,
                    UserName = donation.User.UserName ?? string.Empty
                };

                return Ok(donationDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<DonationDto>> CreateDonation(CreateDonationDto createDto)
        {
            try
            {
                var userId = User.FindFirst("UserId")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var donation = new Donation
                {
                    Category = createDto.Category,
                    Amount = createDto.Amount,
                    TransactionReference = createDto.TransactionReference,
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Donations.Add(donation);
                await _context.SaveChangesAsync();

                var donationDto = new DonationDto
                {
                    DonationId = donation.DonationId,
                    Category = donation.Category,
                    Amount = donation.Amount,
                    TransactionReference = donation.TransactionReference,
                    UserId = donation.UserId,
                    CreatedAt = donation.CreatedAt,
                    UserName = User.FindFirst("Username")?.Value ?? string.Empty
                };

                return CreatedAtAction(nameof(GetDonation), new { id = donation.DonationId }, donationDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<DonationDto>>> GetUserDonations(string userId)
        {
            try
            {
                var currentUserId = User.FindFirst("UserId")?.Value;
                var userRole = User.FindFirst("Role")?.Value;

                // Users can only see their own donations unless they're admin
                if (currentUserId != userId && userRole != "Admin")
                {
                    return Forbid();
                }

                var donations = await _context.Donations
                    .Include(d => d.User)
                    .Where(d => d.UserId == userId)
                    .OrderByDescending(d => d.CreatedAt)
                    .Select(d => new DonationDto
                    {
                        DonationId = d.DonationId,
                        Category = d.Category,
                        Amount = d.Amount,
                        TransactionReference = d.TransactionReference,
                        UserId = d.UserId,
                        CreatedAt = d.CreatedAt,
                        UserName = d.User.UserName ?? string.Empty
                    })
                    .ToListAsync();

                return Ok(donations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("statistics")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<object>> GetDonationStatistics()
        {
            try
            {
                var totalDonations = await _context.Donations.CountAsync();
                var totalAmount = await _context.Donations.SumAsync(d => d.Amount);
                var donationsByCategory = await _context.Donations
                    .GroupBy(d => d.Category)
                    .Select(g => new { Category = g.Key, Count = g.Count(), TotalAmount = g.Sum(d => d.Amount) })
                    .ToListAsync();

                return Ok(new
                {
                    TotalDonations = totalDonations,
                    TotalAmount = totalAmount,
                    DonationsByCategory = donationsByCategory
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
