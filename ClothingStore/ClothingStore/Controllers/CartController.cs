using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ClothingStore.Models;
using ClothingStore.ViewModels.Cart;
using System.Security.Claims;

namespace ClothingStore.Controllers
{
    public class CartController : Controller
    {
        private readonly ClothingStoreContext _context;

        public CartController(ClothingStoreContext context)
        {
            _context = context;
        }

        // GET: Cart (Có thể xem mà không cần đăng nhập, nhưng sẽ khuyến khích đăng nhập)
        public async Task<IActionResult> Index()
        {
            CartViewModel cartViewModel;

            if (User.Identity?.IsAuthenticated == true)
            {
                // User đã đăng nhập - lấy cart từ database
                cartViewModel = await GetCartFromDatabase();
            }
            else
            {
                // User chưa đăng nhập - tạo cart rỗng và khuyến khích đăng nhập
                cartViewModel = new CartViewModel();
                ViewBag.ShowLoginPrompt = true;
            }

            return View(cartViewModel);
        }

        // POST: Cart/AddToCart (Yêu cầu đăng nhập)
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest request)
        {
            var product = await _context.Products
                .Include(p => p.ProductImages)
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.ProductId == request.ProductId);

            if (product == null || !product.IsActive.GetValueOrDefault())
            {
                return Json(new { success = false, message = "Sản phẩm không tồn tại hoặc đã ngừng bán." });
            }

            if (product.StockQuantity < request.Quantity)
            {
                return Json(new { success = false, message = "Không đủ hàng trong kho." });
            }

            var userId = GetCurrentUserId();

            try
            {
                // Lấy hoặc tạo cart cho user
                var cart = await GetOrCreateUserCart(userId);

                // Kiểm tra xem sản phẩm đã có trong cart chưa
                var existingCartItem = await _context.CartItems
                    .FirstOrDefaultAsync(ci => ci.CartId == cart.Id && ci.ProductId == request.ProductId);

                if (existingCartItem != null)
                {
                    // Kiểm tra tổng số lượng sau khi cộng thêm
                    var newQuantity = existingCartItem.Quantity + request.Quantity;
                    if (product.StockQuantity < newQuantity)
                    {
                        return Json(new { success = false, message = "Không đủ hàng trong kho." });
                    }

                    existingCartItem.Quantity = newQuantity;
                    _context.CartItems.Update(existingCartItem);
                }
                else
                {
                    // Thêm sản phẩm mới vào cart
                    var cartItem = new CartItem
                    {
                        CartId = cart.Id,
                        ProductId = request.ProductId,
                        Quantity = request.Quantity,
                        AddedAt = DateTime.Now
                    };

                    _context.CartItems.Add(cartItem);
                }

                // Cập nhật thời gian cart
                cart.UpdatedAt = DateTime.Now;
                _context.Carts.Update(cart);

                await _context.SaveChangesAsync();

                // Lấy thống kê cart mới
                var cartStats = await GetCartStats(userId);

                return Json(new
                {
                    success = true,
                    message = "Đã thêm sản phẩm vào giỏ hàng!",
                    cartCount = cartStats.TotalItems,
                    totalAmount = cartStats.TotalAmount.ToString("N0")
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng." });
            }
        }

        // POST: Cart/UpdateQuantity
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> UpdateQuantity([FromBody] UpdateQuantityRequest request)
        {
            if (request.Quantity <= 0)
            {
                return await RemoveFromCart(new RemoveFromCartRequest { CartItemId = request.CartItemId });
            }

            var userId = GetCurrentUserId();
            var cartItem = await _context.CartItems
                .Include(ci => ci.Cart)
                .Include(ci => ci.Product)
                .FirstOrDefaultAsync(ci => ci.Id == request.CartItemId && ci.Cart.UserId == userId);

            if (cartItem == null)
            {
                return Json(new { success = false, message = "Sản phẩm không có trong giỏ hàng." });
            }

            if (request.Quantity > cartItem.Product.StockQuantity)
            {
                return Json(new { success = false, message = "Không đủ hàng trong kho." });
            }

            try
            {
                cartItem.Quantity = request.Quantity;
                cartItem.Cart.UpdatedAt = DateTime.Now;

                _context.CartItems.Update(cartItem);
                _context.Carts.Update(cartItem.Cart);
                await _context.SaveChangesAsync();

                var cartStats = await GetCartStats(userId);

                return Json(new
                {
                    success = true,
                    cartCount = cartStats.TotalItems,
                    totalAmount = cartStats.TotalAmount.ToString("N0"),
                    itemTotal = (cartItem.Product.Price * cartItem.Quantity).ToString("N0")
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Có lỗi xảy ra khi cập nhật giỏ hàng." });
            }
        }

        // POST: Cart/RemoveFromCart
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> RemoveFromCart([FromBody] RemoveFromCartRequest request)
        {
            var userId = GetCurrentUserId();
            var cartItem = await _context.CartItems
                .Include(ci => ci.Cart)
                .Include(ci => ci.Product)
                .FirstOrDefaultAsync(ci => ci.Id == request.CartItemId && ci.Cart.UserId == userId);

            if (cartItem == null)
            {
                return Json(new { success = false, message = "Sản phẩm không có trong giỏ hàng." });
            }

            try
            {
                _context.CartItems.Remove(cartItem);
                cartItem.Cart.UpdatedAt = DateTime.Now;
                _context.Carts.Update(cartItem.Cart);

                await _context.SaveChangesAsync();

                var cartStats = await GetCartStats(userId);

                return Json(new
                {
                    success = true,
                    message = "Đã xóa sản phẩm khỏi giỏ hàng!",
                    cartCount = cartStats.TotalItems,
                    totalAmount = cartStats.TotalAmount.ToString("N0")
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Có lỗi xảy ra khi xóa sản phẩm." });
            }
        }

        // POST: Cart/ClearCart
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> ClearCart()
        {
            var userId = GetCurrentUserId();
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart != null && cart.CartItems.Any())
            {
                try
                {
                    _context.CartItems.RemoveRange(cart.CartItems);
                    cart.UpdatedAt = DateTime.Now;
                    _context.Carts.Update(cart);

                    await _context.SaveChangesAsync();

                    return Json(new { success = true, message = "Đã xóa toàn bộ giỏ hàng!" });
                }
                catch (Exception ex)
                {
                    return Json(new { success = false, message = "Có lỗi xảy ra khi xóa giỏ hàng." });
                }
            }

            return Json(new { success = true, message = "Giỏ hàng đã trống!" });
        }

        // GET: Cart/GetCartCount
        [HttpGet]
        public async Task<IActionResult> GetCartCount()
        {
            if (User.Identity?.IsAuthenticated != true)
            {
                return Json(new { cartCount = 0 });
            }

            var userId = GetCurrentUserId();
            var cartStats = await GetCartStats(userId);
            return Json(new { cartCount = cartStats.TotalItems });
        }

        // GET: Cart/Checkout
        [Authorize]
        public async Task<IActionResult> Checkout()
        {
            var cartViewModel = await GetCartFromDatabase();

            if (cartViewModel.IsEmpty)
            {
                TempData["ErrorMessage"] = "Giỏ hàng của bạn đang trống.";
                return RedirectToAction(nameof(Index));
            }

            // Kiểm tra lại tồn kho trước khi checkout
            foreach (var item in cartViewModel.Items)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                if (product == null || !product.IsActive.GetValueOrDefault() || product.StockQuantity < item.Quantity)
                {
                    TempData["ErrorMessage"] = $"Sản phẩm '{item.ProductName}' không có đủ hàng trong kho.";
                    return RedirectToAction(nameof(Index));
                }
            }

            var userId = GetCurrentUserId();
            var user = await _context.Users.FindAsync(userId);

            var checkoutViewModel = new CheckoutViewModel
            {
                Cart = cartViewModel,
                CustomerName = user?.Name ?? "",
                CustomerEmail = user?.Email ?? "",
                CustomerPhone = user?.Phone ?? ""
            };

            return View(checkoutViewModel);
        }

        // POST: Cart/ProcessCheckout
        [HttpPost]
        [Authorize]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ProcessCheckout(CheckoutViewModel model)
        {
            if (!ModelState.IsValid)
            {
                model.Cart = await GetCartFromDatabase();
                return View("Checkout", model);
            }

            var userId = GetCurrentUserId();
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null || !cart.CartItems.Any())
            {
                TempData["ErrorMessage"] = "Giỏ hàng của bạn đang trống.";
                return RedirectToAction(nameof(Index));
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Tạo đơn hàng mới
                var order = new Order
                {
                    UserId = userId,
                    OrderDate = DateTime.Now,
                    Status = "Pending",
                    TotalAmount = cart.CartItems.Sum(ci => ci.Product.Price * ci.Quantity)
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                // Thêm các item vào đơn hàng và cập nhật kho
                foreach (var cartItem in cart.CartItems)
                {
                    var product = cartItem.Product;

                    if (product == null || !product.IsActive.GetValueOrDefault() || product.StockQuantity < cartItem.Quantity)
                    {
                        throw new InvalidOperationException($"Sản phẩm '{product?.ProductName}' không có đủ hàng trong kho.");
                    }

                    // Tạo OrderItem
                    var orderItem = new OrderItem
                    {
                        OrderId = order.Id,
                        ProductId = cartItem.ProductId,
                        Quantity = cartItem.Quantity,
                        UnitPrice = product.Price
                    };

                    _context.OrderItems.Add(orderItem);

                    // Cập nhật kho
                    product.StockQuantity -= cartItem.Quantity;
                }

                // Xóa giỏ hàng sau khi đặt hàng thành công
                _context.CartItems.RemoveRange(cart.CartItems);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                TempData["SuccessMessage"] = $"Đặt hàng thành công! Mã đơn hàng: #{order.Id}";
                return RedirectToAction("OrderDetail", "User", new { id = order.Id });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                TempData["ErrorMessage"] = ex.Message;

                model.Cart = await GetCartFromDatabase();
                return View("Checkout", model);
            }
        }

        // Helper Methods
        private async Task<CartViewModel> GetCartFromDatabase()
        {
            var userId = GetCurrentUserId();

            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Product)
                .ThenInclude(p => p.ProductImages)
                .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Product)
                .ThenInclude(p => p.Category)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                return new CartViewModel();
            }

            var cartItems = cart.CartItems.Select(ci => new CartItemViewModel
            {
                Id = ci.Id,
                ProductId = ci.ProductId,
                ProductName = ci.Product.ProductName,
                Price = ci.Product.Price,
                Quantity = ci.Quantity,
                ImageUrl = ci.Product.ProductImages.OrderByDescending(pi => pi.IsPrimary)
                    .Select(pi => pi.ImageUrl)
                    .FirstOrDefault() ?? "https://via.placeholder.com/150x150",
                CategoryName = ci.Product.Category.CategoryName,
                StockQuantity = ci.Product.StockQuantity.GetValueOrDefault(),
                IsActive = ci.Product.IsActive.GetValueOrDefault(),
                AddedAt = ci.AddedAt,
                Size = ci.Product.Size,
                Color = ci.Product.Color,
                Material = ci.Product.Material
            }).ToList();

            return new CartViewModel
            {
                Items = cartItems,
                TotalAmount = cartItems.Sum(x => x.SubTotal),
                TotalItems = cartItems.Sum(x => x.Quantity)
            };
        }

        private async Task<Cart> GetOrCreateUserCart(int userId)
        {
            var cart = await _context.Carts.FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                cart = new Cart
                {
                    UserId = userId,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };

                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            return cart;
        }

        private async Task<(int TotalItems, decimal TotalAmount)> GetCartStats(int userId)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                return (0, 0);
            }

            var totalItems = cart.CartItems.Sum(ci => ci.Quantity);
            var totalAmount = cart.CartItems.Sum(ci => ci.Product.Price * ci.Quantity);

            return (totalItems, totalAmount);
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : 0;
        }
    }

    // Request Models cho API calls
    public class UpdateQuantityRequest
    {
        public int CartItemId { get; set; }
        public int Quantity { get; set; }
    }

    public class RemoveFromCartRequest
    {
        public int CartItemId { get; set; }
    }
}