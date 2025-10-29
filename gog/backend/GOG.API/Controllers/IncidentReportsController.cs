using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GOG.API.Data;
using GOG.API.DTOs;
using GOG.API.Models;
using GOG.API.Services;

namespace GOG.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class IncidentReportsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IBlobStorageService _blobStorageService;

        public IncidentReportsController(ApplicationDbContext context, IBlobStorageService blobStorageService)
        {
            _context = context;
            _blobStorageService = blobStorageService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<IncidentReportDto>>> GetIncidentReports()
        {
            try
            {
                var reports = await _context.IncidentReports
                    .Include(r => r.User)
                    .OrderByDescending(r => r.CreatedAt)
                    .Select(r => new IncidentReportDto
                    {
                        ReportId = r.ReportId,
                        UserId = r.UserId,
                        Description = r.Description,
                        Location = r.Location,
                        ReportType = r.ReportType,
                        ImageUrl = r.ImageUrl,
                        CreatedAt = r.CreatedAt,
                        UserName = r.User.UserName ?? string.Empty
                    })
                    .ToListAsync();

                return Ok(reports);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<IncidentReportDto>> GetIncidentReport(int id)
        {
            try
            {
                var report = await _context.IncidentReports
                    .Include(r => r.User)
                    .FirstOrDefaultAsync(r => r.ReportId == id);

                if (report == null)
                {
                    return NotFound();
                }

                var reportDto = new IncidentReportDto
                {
                    ReportId = report.ReportId,
                    UserId = report.UserId,
                    Description = report.Description,
                    Location = report.Location,
                    ReportType = report.ReportType,
                    ImageUrl = report.ImageUrl,
                    CreatedAt = report.CreatedAt,
                    UserName = report.User.UserName ?? string.Empty
                };

                return Ok(reportDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<IncidentReportDto>> CreateIncidentReport([FromForm] CreateIncidentReportDto createDto)
        {
            try
            {
                var userId = User.FindFirst("UserId")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var report = new IncidentReport
                {
                    UserId = userId,
                    Description = createDto.Description,
                    Location = createDto.Location,
                    ReportType = createDto.ReportType,
                    CreatedAt = DateTime.UtcNow
                };

                // Handle image upload
                if (createDto.Image != null && createDto.Image.Length > 0)
                {
                    var fileName = $"incident_{report.ReportId}_{Guid.NewGuid()}{Path.GetExtension(createDto.Image.FileName)}";
                    report.ImageUrl = await _blobStorageService.UploadImageAsync(createDto.Image, "incident-images", fileName);
                }

                _context.IncidentReports.Add(report);
                await _context.SaveChangesAsync();

                var reportDto = new IncidentReportDto
                {
                    ReportId = report.ReportId,
                    UserId = report.UserId,
                    Description = report.Description,
                    Location = report.Location,
                    ReportType = report.ReportType,
                    ImageUrl = report.ImageUrl,
                    CreatedAt = report.CreatedAt,
                    UserName = User.FindFirst("Username")?.Value ?? string.Empty
                };

                return CreatedAtAction(nameof(GetIncidentReport), new { id = report.ReportId }, reportDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateIncidentReport(int id, UpdateIncidentReportDto updateDto)
        {
            try
            {
                var userId = User.FindFirst("UserId")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var report = await _context.IncidentReports.FindAsync(id);
                if (report == null)
                {
                    return NotFound();
                }

                // Check if user owns the report or is admin
                var userRole = User.FindFirst("Role")?.Value;
                if (report.UserId != userId && userRole != "Admin")
                {
                    return Forbid();
                }

                report.Description = updateDto.Description;
                report.Location = updateDto.Location;
                report.ReportType = updateDto.ReportType;
                report.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteIncidentReport(int id)
        {
            try
            {
                var userId = User.FindFirst("UserId")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var report = await _context.IncidentReports.FindAsync(id);
                if (report == null)
                {
                    return NotFound();
                }

                // Check if user owns the report or is admin
                var userRole = User.FindFirst("Role")?.Value;
                if (report.UserId != userId && userRole != "Admin")
                {
                    return Forbid();
                }

                // Delete image from blob storage if exists
                if (!string.IsNullOrEmpty(report.ImageUrl))
                {
                    var fileName = Path.GetFileName(report.ImageUrl);
                    await _blobStorageService.DeleteImageAsync("incident-images", fileName);
                }

                _context.IncidentReports.Remove(report);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
