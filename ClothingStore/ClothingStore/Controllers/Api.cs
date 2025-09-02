using ClothingStore.Models;
using ClothingStore.Services;
using ClothingStore.Utils;
using ClothingStore.ViewModels.Account;
using ClothingStore.ViewModels.JWT;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthApiController : ControllerBase
    {
        private readonly ClothingStoreContext _context;
        private readonly IJwtService _jwtService;

        public AuthApiController(ClothingStoreContext context, IJwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        // POST: api/AuthApi/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new JwtLoginResponse
                {
                    Success = false,
                    Message = "Dữ liệu không hợp lệ"
                });
            }

            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == model.Email);

                if (user == null || !PasswordHelper.VerifyPassword(model.Password, user.PasswordHash))
                {
                    return BadRequest(new JwtLoginResponse
                    {
                        Success = false,
                        Message = "Email hoặc mật khẩu không đúng"
                    });
                }

                // Generate JWT
                var accessToken = _jwtService.GenerateAccessToken(user);
                var expiresAt = DateTime.UtcNow.AddMinutes(15);

                var response = new JwtLoginResponse
                {
                    Success = true,
                    Message = "Đăng nhập thành công",
                    AccessToken = accessToken,
                    ExpiresAt = expiresAt,
                    User = new UserDto
                    {
                        Id = user.Id,
                        Name = user.Name,
                        Email = user.Email,
                        Role = user.Role
                    }
                };

                return Ok(response);
            }
            catch (Exception)
            {
                return StatusCode(500, new JwtLoginResponse
                {
                    Success = false,
                    Message = "Có lỗi xảy ra trên server"
                });
            }
        }

        // POST: api/AuthApi/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new JwtLoginResponse
                {
                    Success = false,
                    Message = "Dữ liệu không hợp lệ"
                });
            }

            try
            {
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == model.Email);

                if (existingUser != null)
                {
                    return BadRequest(new JwtLoginResponse
                    {
                        Success = false,
                        Message = "Email này đã được sử dụng"
                    });
                }

                var user = new User
                {
                    Name = model.Name,
                    Email = model.Email,
                    PasswordHash = PasswordHelper.HashPassword(model.Password),
                    Phone = model.Phone,
                    Role = "User",
                    CreatedAt = DateTime.Now
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return Ok(new JwtLoginResponse
                {
                    Success = true,
                    Message = "Đăng ký thành công"
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new JwtLoginResponse
                {
                    Success = false,
                    Message = "Có lỗi xảy ra trên server"
                });
            }
        }

        // GET: api/AuthApi/test
        [HttpGet("test")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public IActionResult Test()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var userName = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

            return Ok(new
            {
                Success = true,
                Message = "JWT hoạt động tốt!",
                UserId = userId,
                UserName = userName,
                UserRole = userRole
            });
        }
    }
}
