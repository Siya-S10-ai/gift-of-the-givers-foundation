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
    public class TasksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TasksController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskDto>>> GetTasks()
        {
            try
            {
                var tasks = await _context.Tasks
                    .Include(t => t.Volunteer)
                    .OrderByDescending(t => t.CreatedAt)
                    .Select(t => new TaskDto
                    {
                        TaskId = t.TaskId,
                        Description = t.Description,
                        Status = t.Status,
                        VolunteerId = t.VolunteerId,
                        Category = t.Category,
                        CreatedAt = t.CreatedAt,
                        VolunteerName = t.Volunteer != null ? t.Volunteer.UserName : null
                    })
                    .ToListAsync();

                return Ok(tasks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TaskDto>> GetTask(int id)
        {
            try
            {
                var task = await _context.Tasks
                    .Include(t => t.Volunteer)
                    .FirstOrDefaultAsync(t => t.TaskId == id);

                if (task == null)
                {
                    return NotFound();
                }

                var taskDto = new TaskDto
                {
                    TaskId = task.TaskId,
                    Description = task.Description,
                    Status = task.Status,
                    VolunteerId = task.VolunteerId,
                    Category = task.Category,
                    CreatedAt = task.CreatedAt,
                    VolunteerName = task.Volunteer?.UserName
                };

                return Ok(taskDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<TaskDto>> CreateTask(CreateTaskDto createDto)
        {
            try
            {
                var task = new Models.Task
                {
                    Description = createDto.Description,
                    Category = createDto.Category,
                    Status = "Available",
                    CreatedAt = DateTime.UtcNow
                };

                _context.Tasks.Add(task);
                await _context.SaveChangesAsync();

                var taskDto = new TaskDto
                {
                    TaskId = task.TaskId,
                    Description = task.Description,
                    Status = task.Status,
                    VolunteerId = task.VolunteerId,
                    Category = task.Category,
                    CreatedAt = task.CreatedAt,
                    VolunteerName = null
                };

                return CreatedAtAction(nameof(GetTask), new { id = task.TaskId }, taskDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateTask(int id, UpdateTaskDto updateDto)
        {
            try
            {
                var task = await _context.Tasks.FindAsync(id);
                if (task == null)
                {
                    return NotFound();
                }

                task.Description = updateDto.Description;
                task.Status = updateDto.Status;
                task.VolunteerId = updateDto.VolunteerId;
                task.Category = updateDto.Category;
                task.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("{id}/assign")]
        [Authorize(Roles = "Volunteer")]
        public async Task<IActionResult> AssignTask(int id, AssignTaskDto assignDto)
        {
            try
            {
                var userId = User.FindFirst("UserId")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var task = await _context.Tasks.FindAsync(id);
                if (task == null)
                {
                    return NotFound();
                }

                if (task.Status != "Available")
                {
                    return BadRequest("Task is not available for assignment");
                }

                // Check if volunteer exists and has correct role
                var volunteer = await _context.Users.FindAsync(assignDto.VolunteerId);
                if (volunteer == null || volunteer.Role != "Volunteer")
                {
                    return BadRequest("Invalid volunteer");
                }

                task.Status = "Assigned";
                task.VolunteerId = assignDto.VolunteerId;
                task.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("{id}/complete")]
        [Authorize(Roles = "Volunteer")]
        public async Task<IActionResult> CompleteTask(int id)
        {
            try
            {
                var userId = User.FindFirst("UserId")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var task = await _context.Tasks.FindAsync(id);
                if (task == null)
                {
                    return NotFound();
                }

                if (task.VolunteerId != userId)
                {
                    return Forbid("You can only complete tasks assigned to you");
                }

                if (task.Status != "Assigned")
                {
                    return BadRequest("Task must be assigned before it can be completed");
                }

                task.Status = "Completed";
                task.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            try
            {
                var task = await _context.Tasks.FindAsync(id);
                if (task == null)
                {
                    return NotFound();
                }

                _context.Tasks.Remove(task);
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
