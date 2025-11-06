using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GOG.API.Data;
using GOG.API.DTOs;
using GOG.API.Models;
using GOG.API.Services;
using Microsoft.AspNetCore.Authorization;

namespace GOG.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IJwtService _jwtService;
        private readonly ApplicationDbContext _context;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IJwtService jwtService,
            ApplicationDbContext context)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _jwtService = jwtService;
            _context = context;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto registerDto)
        {
            try
            {
                // Check if user already exists
                var existingUser = await _userManager.FindByEmailAsync(registerDto.Email);
                if (existingUser != null)
                {
                    return BadRequest("User with this email already exists");
                }

                // Create new user
                var user = new ApplicationUser
                {
                    UserName = registerDto.Username,
                    Email = registerDto.Email,
                    Name = registerDto.Name,
                    Surname = registerDto.Surname,
                    PhoneNumber = registerDto.Phone,
                    Role = registerDto.Role
                };

                var result = await _userManager.CreateAsync(user, registerDto.Password);

                if (!result.Succeeded)
                {
                    return BadRequest(result.Errors);
                }

                // Add user to role
                await _userManager.AddToRoleAsync(user, registerDto.Role);

                // Generate JWT token
                var token = _jwtService.GenerateToken(user);

                return Ok(new AuthResponseDto
                {
                    Token = token,
                    UserId = user.Id,
                    Username = user.UserName ?? string.Empty,
                    Role = user.Role,
                    Email = user.Email ?? string.Empty
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginDto loginDto)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(loginDto.Email);
                if (user == null)
                {
                    return Unauthorized("Invalid email or password");
                }

                var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);
                if (!result.Succeeded)
                {
                    return Unauthorized("Invalid email or password");
                }

                // Generate JWT token
                var token = _jwtService.GenerateToken(user);

                return Ok(new AuthResponseDto
                {
                    Token = token,
                    UserId = user.Id,
                    Username = user.UserName ?? string.Empty,
                    Role = user.Role,
                    Email = user.Email ?? string.Empty
                });
            }
            catch (Exception ex)
            {
                // ----------- OFFLINE FALLBACK (BEGIN) ----------
                // If Identity/DB lookups fail (e.g., database down), allow a hardcoded offline login.
                // This does not change the normal auth logic above; it only runs in failure scenarios.
                if (string.Equals(loginDto.Email, "siya123@gmail.com", StringComparison.OrdinalIgnoreCase)
                    && loginDto.Password == "12345678")
                {
                    // Return a fake token and a minimal user payload through the existing DTO.
                    // Note: This token will not validate against real JWT middleware unless adapeted;
                    // it is intended as a temporary, emergency offline login.
                    return Ok(new AuthResponseDto
                    {
                        Token = "FAKE-USER-TOKEN",
                        UserId = "offline-user",
                        Username = "Offline User",
                        Role = "Volunteer",
                        Email = "siya123@gmail.com"
                    });
                }
                // ---------- OFFLINE FALLBACK (END) ----------
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<ActionResult<UserProfileDto>> GetProfile()
        {
            try
            {
                var userId = User.FindFirst("UserId")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return NotFound("User not found");
                }

                return Ok(new UserProfileDto
                {
                    UserId = user.Id,
                    Name = user.Name,
                    Surname = user.Surname,
                    Username = user.UserName ?? string.Empty,
                    Email = user.Email ?? string.Empty,
                    Phone = user.PhoneNumber ?? string.Empty,
                    Role = user.Role
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<ActionResult<UserProfileDto>> UpdateProfile(UpdateProfileDto updateDto)
        {
            try
            {
                var userId = User.FindFirst("UserId")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return NotFound("User not found");
                }

                // Update user properties
                user.Name = updateDto.Name;
                user.Surname = updateDto.Surname;
                user.UserName = updateDto.Username;
                user.Email = updateDto.Email;
                user.PhoneNumber = updateDto.Phone;

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                {
                    return BadRequest(result.Errors);
                }

                return Ok(new UserProfileDto
                {
                    UserId = user.Id,
                    Name = user.Name,
                    Surname = user.Surname,
                    Username = user.UserName ?? string.Empty,
                    Email = user.Email ?? string.Empty,
                    Phone = user.PhoneNumber ?? string.Empty,
                    Role = user.Role
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
