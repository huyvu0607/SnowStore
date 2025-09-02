using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClothingStore.Models;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;
using ClothingStore.ViewModels.User;

namespace ClothingStore.Controllers
{
    [Authorize]
    public class UserController : Controller
    {
        private readonly ClothingStoreContext _context;

        public UserController(ClothingStoreContext context)
        {
            _context = context;
        }

        // GET: User/Profile
        public async Task<IActionResult> Profile()
        {
            var userId = GetCurrentUserId();
            var user = await _context.Users
                .Include(u => u.Orders)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound();
            }

            var totalSpent = await _context.Orders
                .Where(o => o.UserId == userId && o.Status != "Cancelled")
                .SumAsync(o => o.TotalAmount);

            var userProfile = new UserProfileViewModel
            {
                Id = user.Id.ToString(),
                FullName = user.Name,
                Email = user.Email,
                Phone = user.Phone ?? "",
                Role = user.Role,
                JoinDate = user.CreatedAt,
                TotalOrders = user.Orders?.Count ?? 0,
                TotalSpent = totalSpent,
                MembershipLevel = GetMembershipLevel(totalSpent)
            };

            return View(userProfile);
        }

        // GET: User/Orders
        public async Task<IActionResult> Orders(string status = "all")
        {
            var userId = GetCurrentUserId();
            var ordersQuery = _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Where(o => o.UserId == userId);

            if (!string.IsNullOrEmpty(status) && status != "all")
            {
                ordersQuery = ordersQuery.Where(o => o.Status.ToLower() == status.ToLower());
            }

            var orders = await ordersQuery
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new OrderViewModel
                {
                    Id = o.Id.ToString(),
                    OrderDate = o.OrderDate,
                    Status = o.Status,
                    TotalAmount = o.TotalAmount,
                    ItemCount = o.OrderItems.Count,
                    Items = o.OrderItems.Select(oi => new OrderItemViewModel
                    {
                        ProductId = oi.Product.ProductId.ToString(),
                        ProductName = oi.Product.ProductName,
                        ImageUrl = oi.Product.ProductImages.OrderByDescending(pi => pi.IsPrimary) // ưu tiên ảnh chính
                        .Select(pi => pi.ImageUrl)
                        .FirstOrDefault()
                        ?? "https://via.placeholder.com/150x150",
                        Price = oi.UnitPrice,
                        Quantity = oi.Quantity
                    }).ToList()
                })
                .ToListAsync();

            ViewBag.CurrentStatus = status;
            ViewBag.StatusCounts = await GetOrderStatusCounts(userId);

            return View(orders);
        }

        // GET: User/OrderDetail/5
        public async Task<IActionResult> OrderDetail(int id)
        {
            var userId = GetCurrentUserId();
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Include(o => o.User)
                .Where(o => o.Id == id && o.UserId == userId)
                .Select(o => new OrderDetailViewModel
                {
                    Id = o.Id.ToString(),
                    OrderDate = o.OrderDate,
                    Status = o.Status,
                    TotalAmount = o.TotalAmount,
                    CustomerName = o.User.Name,
                    CustomerEmail = o.User.Email,
                    CustomerPhone = o.User.Phone ?? "",
                    Items = o.OrderItems.Select(oi => new OrderItemViewModel
                    {
                        ProductId = oi.Product.ProductId.ToString(),
                        ProductName = oi.Product.ProductName,
                        ImageUrl = oi.Product.ProductImages
                            .OrderByDescending(pi => pi.IsPrimary) // ưu tiên ảnh chính
                            .Select(pi => pi.ImageUrl)
                            .FirstOrDefault()
                            ?? "https://via.placeholder.com/150x150",
                        Price = oi.UnitPrice,
                        Quantity = oi.Quantity,
                        CategoryName = oi.Product.Category != null ? oi.Product.Category.CategoryName : ""
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (order == null)
            {
                return NotFound();
            }

            return View(order);
        }

        // GET: User/EditProfile
        public async Task<IActionResult> EditProfile()
        {
            var userId = GetCurrentUserId();
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return NotFound();
            }

            var userProfile = new EditProfileViewModel
            {
                Id = user.Id.ToString(),
                FullName = user.Name,
                Email = user.Email,
                Phone = user.Phone ?? ""
            };

            return View(userProfile);
        }

        // POST: User/EditProfile
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> EditProfile(EditProfileViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            var userId = GetCurrentUserId();
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return NotFound();
            }

            // Kiểm tra email có trùng với user khác không
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == model.Email && u.Id != userId);

            if (existingUser != null)
            {
                ModelState.AddModelError("Email", "Email này đã được sử dụng bởi tài khoản khác.");
                return View(model);
            }

            // Cập nhật thông tin user
            user.Name = model.FullName;
            user.Email = model.Email;
            user.Phone = model.Phone;

            try
            {
                await _context.SaveChangesAsync();
                TempData["SuccessMessage"] = "Cập nhật thông tin thành công!";
                return RedirectToAction(nameof(Profile));
            }
            catch (Exception)
            {
                ModelState.AddModelError("", "Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.");
                return View(model);
            }
        }

        // Helper methods
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 0;
        }

        private string GetMembershipLevel(decimal totalSpent)
        {
            if (totalSpent >= 10000000) return "Diamond";
            if (totalSpent >= 5000000) return "Platinum";
            if (totalSpent >= 2000000) return "Gold";
            if (totalSpent >= 500000) return "Silver";
            return "Bronze";
        }

        private async Task<Dictionary<string, int>> GetOrderStatusCounts(int userId)
        {
            var counts = await _context.Orders
                .Where(o => o.UserId == userId)
                .GroupBy(o => o.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Status, x => x.Count);

            var result = new Dictionary<string, int>
            {
                ["all"] = counts.Values.Sum(),
                ["pending"] = counts.GetValueOrDefault("Pending", 0),
                ["paid"] = counts.GetValueOrDefault("Paid", 0),
                ["shipped"] = counts.GetValueOrDefault("Shipped", 0),
                ["delivered"] = counts.GetValueOrDefault("Delivered", 0),
                ["cancelled"] = counts.GetValueOrDefault("Cancelled", 0)
            };

            return result;
        }
    }



   
}