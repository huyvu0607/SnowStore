using ClothingStore.Models;
using ClothingStore.Services;
using ClothingStore.ViewModels.Account;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Controllers
{
    public class AccountController : Controller
    {
        private readonly ClothingStoreContext _context; // Thay bằng tên DbContext của bạn
        private readonly IEmailService _emailService;

        public AccountController(ClothingStoreContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // GET: Account/Login
        [HttpGet]
        public IActionResult Login(string? returnUrl = null)
        {
            ViewData["ReturnUrl"] = returnUrl;
            return View();
        }

        // POST: Account/Login
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(LoginViewModel model, string? returnUrl = null)
        {
            ViewData["ReturnUrl"] = returnUrl;

            if (ModelState.IsValid)
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == model.Email);

                if (user != null && VerifyPassword(model.Password, user.PasswordHash))
                {
                    var claims = new List<Claim>
                    {
                        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                        new Claim(ClaimTypes.Name, user.Name),
                        new Claim(ClaimTypes.Email, user.Email),
                        new Claim(ClaimTypes.Role, user.Role)
                    };

                    var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                    var authProperties = new AuthenticationProperties
                    {
                        IsPersistent = model.RememberMe
                    };

                    await HttpContext.SignInAsync(
                        CookieAuthenticationDefaults.AuthenticationScheme,
                        new ClaimsPrincipal(claimsIdentity),
                        authProperties);

                    if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
                    {
                        return Redirect(returnUrl);
                    }
                    return RedirectToAction("Index", "Home");
                }

                ModelState.AddModelError(string.Empty, "Email hoặc mật khẩu không đúng.");
            }

            return View(model);
        }

        // GET: Account/Register
        [HttpGet]
        public IActionResult Register()
        {
            return View();
        }

        // POST: Account/Register
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            if (ModelState.IsValid)
            {
                // Kiểm tra email đã tồn tại chưa
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == model.Email);

                if (existingUser != null)
                {
                    ModelState.AddModelError("Email", "Email này đã được sử dụng.");
                    return View(model);
                }

                // Tạo user mới
                var user = new User
                {
                    Name = model.Name,
                    Email = model.Email,
                    PasswordHash = HashPassword(model.Password),
                    Phone = model.Phone,
                    Role = "User",
                    CreatedAt = DateTime.Now
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                TempData["SuccessMessage"] = "Đăng ký thành công! Vui lòng đăng nhập.";
                return RedirectToAction("Login");
            }

            return View(model);
        }

        // GET: Account/ForgotPassword
        [HttpGet]
        public IActionResult ForgotPassword()
        {
            return View();
        }

        // POST: Account/ForgotPassword
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ForgotPassword(string email)
        {
            if (string.IsNullOrEmpty(email))
            {
                TempData["ErrorMessage"] = "Vui lòng nhập email.";
                return View();
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                TempData["ErrorMessage"] = "Email không tồn tại trong hệ thống.";
                return View();
            }

            // Tạo token reset
            var token = Guid.NewGuid().ToString("N");
            var expiryDate = DateTime.UtcNow.AddMinutes(30);

            var resetToken = new PasswordResetToken
            {
                UserId = user.Id,
                Token = token,
                ExpiryDate = expiryDate,
                IsUsed = false
            };

            _context.PasswordResetTokens.Add(resetToken);
            await _context.SaveChangesAsync();

            // Tạo link reset password
            var resetLink = Url.Action("ResetPassword", "Account",
                new { email = user.Email, token = token }, Request.Scheme);

            // Gửi email qua EmailService
            await _emailService.SendPasswordResetEmailAsync(user.Email, resetLink);

            TempData["SuccessMessage"] = "Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư.";
            return RedirectToAction("Login");
        }


        //// POST: Account/ForgotPassword
        //[HttpPost]
        //[ValidateAntiForgeryToken]
        //public async Task<IActionResult> ForgotPassword(ForgotPasswordViewModel model)
        //{
        //    if (ModelState.IsValid)
        //    {
        //        var user = await _context.Users
        //            .FirstOrDefaultAsync(u => u.Email == model.Email);

        //        if (user != null)
        //        {
        //            // Tạo token reset password
        //            var token = GenerateRandomToken();
        //            var resetLink = Url.Action("ResetPassword", "Account",
        //                new { email = user.Email, token = token }, Request.Scheme);

        //            // Lưu token vào session hoặc cache (ở đây dùng session đơn giản)
        //            HttpContext.Session.SetString($"ResetToken_{user.Email}", token);
        //            HttpContext.Session.SetString($"ResetTokenExpiry_{user.Email}",
        //                DateTime.Now.AddHours(24).ToString());

        //            // Gửi email
        //            await _emailService.SendPasswordResetEmailAsync(user.Email, resetLink!);
        //        }

        //        // Luôn hiển thị thông báo thành công để tránh lộ thông tin user
        //        TempData["SuccessMessage"] = "Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.";
        //        return RedirectToAction("Login");
        //    }

        //    return View(model);
        //}

        //// GET: Account/ResetPassword
        //[HttpGet]
        //public async Task<IActionResult> ResetPassword(string email, string token)
        //{
        //    if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(token))
        //    {
        //        return BadRequest("Link không hợp lệ.");
        //    }

        //    // Kiểm tra token
        //    var savedToken = HttpContext.Session.GetString($"ResetToken_{email}");
        //    var tokenExpiry = HttpContext.Session.GetString($"ResetTokenExpiry_{email}");

        //    if (savedToken != token || string.IsNullOrEmpty(tokenExpiry) ||
        //        DateTime.Parse(tokenExpiry) < DateTime.Now)
        //    {
        //        TempData["ErrorMessage"] = "Link đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.";
        //        return RedirectToAction("Login");
        //    }

        //    // Kiểm tra user tồn tại
        //    var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        //    if (user == null)
        //    {
        //        TempData["ErrorMessage"] = "Người dùng không tồn tại.";
        //        return RedirectToAction("Login");
        //    }

        //    var model = new ResetPasswordViewModel
        //    {
        //        Email = email,
        //        Token = token
        //    };

        //    return View(model);
        //}

        //// POST: Account/ResetPassword
        //[HttpPost]
        //[ValidateAntiForgeryToken]
        //public async Task<IActionResult> ResetPassword(ResetPasswordViewModel model)
        //{
        //    if (ModelState.IsValid)
        //    {
        //        // Kiểm tra token lần nữa
        //        var savedToken = HttpContext.Session.GetString($"ResetToken_{model.Email}");
        //        var tokenExpiry = HttpContext.Session.GetString($"ResetTokenExpiry_{model.Email}");

        //        if (savedToken != model.Token || string.IsNullOrEmpty(tokenExpiry) ||
        //            DateTime.Parse(tokenExpiry) < DateTime.Now)
        //        {
        //            TempData["ErrorMessage"] = "Link đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.";
        //            return RedirectToAction("Login");
        //        }

        //        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Email);
        //        if (user != null)
        //        {
        //            user.PasswordHash = HashPassword(model.NewPassword);
        //            await _context.SaveChangesAsync();

        //            // Xóa token
        //            HttpContext.Session.Remove($"ResetToken_{model.Email}");
        //            HttpContext.Session.Remove($"ResetTokenExpiry_{model.Email}");

        //            TempData["SuccessMessage"] = "Đặt lại mật khẩu thành công! Vui lòng đăng nhập.";
        //            return RedirectToAction("Login");
        //        }
        //    }

        //    return View(model);
        //}

        // GET: Account/ResetPassword
        [HttpGet]
        public async Task<IActionResult> ResetPassword(string email, string token)
        {
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(token))
            {
                return BadRequest("Link không hợp lệ.");
            }

            // Tìm user
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                TempData["ErrorMessage"] = "Người dùng không tồn tại.";
                return RedirectToAction("Login");
            }

            // Kiểm tra token trong DB
            var resetToken = await _context.PasswordResetTokens
                .FirstOrDefaultAsync(t => t.UserId == user.Id && t.Token == token && !t.IsUsed);

            if (resetToken == null || resetToken.ExpiryDate < DateTime.UtcNow)
            {
                TempData["ErrorMessage"] = "Link đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.";
                return RedirectToAction("Login");
            }

            var model = new ResetPasswordViewModel
            {
                Email = email,
                Token = token
            };

            return View(model);
        }

        // POST: Account/ResetPassword
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ResetPassword(ResetPasswordViewModel model)
        {
            if (!ModelState.IsValid)
                return View(model);

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Email);
            if (user == null)
            {
                TempData["ErrorMessage"] = "Người dùng không tồn tại.";
                return RedirectToAction("Login");
            }

            // Kiểm tra token
            var resetToken = await _context.PasswordResetTokens
                .FirstOrDefaultAsync(t => t.UserId == user.Id && t.Token == model.Token && !t.IsUsed);

            if (resetToken == null || resetToken.ExpiryDate < DateTime.UtcNow)
            {
                TempData["ErrorMessage"] = "Link đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.";
                return RedirectToAction("Login");
            }

            // Cập nhật mật khẩu
            user.PasswordHash = HashPassword(model.NewPassword);

            // Đánh dấu token đã sử dụng
            resetToken.IsUsed = true;

            _context.Users.Update(user);
            _context.PasswordResetTokens.Update(resetToken);
            await _context.SaveChangesAsync();

            TempData["SuccessMessage"] = "Đặt lại mật khẩu thành công! Vui lòng đăng nhập.";
            return RedirectToAction("Login");
        }

        // POST: Account/Logout
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToAction("Index", "Home");
        }

        // Helper methods
        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }

        private bool VerifyPassword(string password, string hash)
        {
            var hashOfInput = HashPassword(password);
            return hashOfInput == hash;
        }

        private string GenerateRandomToken()
        {
            using (var rng = RandomNumberGenerator.Create())
            {
                var tokenBytes = new byte[32];
                rng.GetBytes(tokenBytes);
                return Convert.ToBase64String(tokenBytes);
            }
        }
    }
}
