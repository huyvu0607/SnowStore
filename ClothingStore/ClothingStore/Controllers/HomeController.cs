using ClothingStore.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;

namespace ClothingStore.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly ClothingStoreContext _context; // Thay tên context phù hợp với project của bạn

        public HomeController(ILogger<HomeController> logger, ClothingStoreContext context)
        {
            _logger = logger;
            _context = context;
        }

        public async Task<IActionResult> Index(int? categoryId, string searchTerm)
        {
            // Lấy danh sách categories
            var categories = await _context.Categories
                .Where(c => c.Products.Any(p => p.IsActive == true))
                .ToListAsync();

            // Query products
            var productsQuery = _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductImages)
                .Where(p => p.IsActive == true);

            // Filter by category
            if (categoryId.HasValue)
            {
                productsQuery = productsQuery.Where(p => p.CategoryId == categoryId.Value);
            }

            // Filter by search term
            if (!string.IsNullOrEmpty(searchTerm))
            {
                productsQuery = productsQuery.Where(p =>
                    p.ProductName.Contains(searchTerm) ||
                    p.Description.Contains(searchTerm));
            }

            var products = await productsQuery
                .OrderByDescending(p => p.CreatedDate)
                .ToListAsync();

            ViewBag.Categories = categories;
            ViewBag.CurrentCategoryId = categoryId;
            ViewBag.SearchTerm = searchTerm;

            return View(products);
        }

        // API endpoint để lấy chi tiết product cho popup
        [HttpGet]
        public async Task<IActionResult> GetProductDetails(int productId)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductImages.OrderBy(pi => pi.DisplayOrder))
                .FirstOrDefaultAsync(p => p.ProductId == productId && p.IsActive == true);

            if (product == null)
            {
                return NotFound();
            }

            return Json(new
            {
                productId = product.ProductId,
                productName = product.ProductName,
                description = product.Description,
                price = product.Price,
                size = product.Size,
                color = product.Color,
                material = product.Material,
                stockQuantity = product.StockQuantity,
                categoryName = product.Category.CategoryName,
                images = product.ProductImages.Select(pi => new
                {
                    imageUrl = pi.ImageUrl,
                    altText = pi.AltText,
                    isPrimary = pi.IsPrimary
                }).ToList()
            });
        }

        [Authorize]
        public IActionResult Profile()
        {
            return View();
        }

        [Authorize(Roles = "Admin")]
        public IActionResult AdminPanel()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}