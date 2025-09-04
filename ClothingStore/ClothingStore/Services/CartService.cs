using ClothingStore.Models;
using ClothingStore.ViewModels.Cart;
using Microsoft.EntityFrameworkCore;

namespace ClothingStore.Services
{
    public class CartService : ICartService
    {
        private readonly ClothingStoreContext _context;

        public CartService(ClothingStoreContext context)
        {
            _context = context;
        }

        public async Task<CartViewModel> GetUserCartAsync(int userId)
        {
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

        public async Task<bool> AddToCartAsync(int userId, int productId, int quantity)
        {
            var product = await _context.Products.FindAsync(productId);

            if (product == null || !product.IsActive.GetValueOrDefault() || product.StockQuantity < quantity)
            {
                return false;
            }

            try
            {
                var cart = await GetOrCreateUserCartAsync(userId);
                var existingCartItem = await _context.CartItems
                    .FirstOrDefaultAsync(ci => ci.CartId == cart.Id && ci.ProductId == productId);

                if (existingCartItem != null)
                {
                    var newQuantity = existingCartItem.Quantity + quantity;
                    if (product.StockQuantity < newQuantity)
                    {
                        return false;
                    }

                    existingCartItem.Quantity = newQuantity;
                    _context.CartItems.Update(existingCartItem);
                }
                else
                {
                    var cartItem = new CartItem
                    {
                        CartId = cart.Id,
                        ProductId = productId,
                        Quantity = quantity,
                        AddedAt = DateTime.Now
                    };

                    _context.CartItems.Add(cartItem);
                }

                cart.UpdatedAt = DateTime.Now;
                _context.Carts.Update(cart);
                await _context.SaveChangesAsync();

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> UpdateQuantityAsync(int userId, int cartItemId, int quantity)
        {
            var cartItem = await _context.CartItems
                .Include(ci => ci.Cart)
                .Include(ci => ci.Product)
                .FirstOrDefaultAsync(ci => ci.Id == cartItemId && ci.Cart.UserId == userId);

            if (cartItem == null || quantity > cartItem.Product.StockQuantity)
            {
                return false;
            }

            try
            {
                cartItem.Quantity = quantity;
                cartItem.Cart.UpdatedAt = DateTime.Now;

                _context.CartItems.Update(cartItem);
                _context.Carts.Update(cartItem.Cart);
                await _context.SaveChangesAsync();

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> RemoveFromCartAsync(int userId, int cartItemId)
        {
            var cartItem = await _context.CartItems
                .Include(ci => ci.Cart)
                .FirstOrDefaultAsync(ci => ci.Id == cartItemId && ci.Cart.UserId == userId);

            if (cartItem == null)
            {
                return false;
            }

            try
            {
                _context.CartItems.Remove(cartItem);
                cartItem.Cart.UpdatedAt = DateTime.Now;
                _context.Carts.Update(cartItem.Cart);
                await _context.SaveChangesAsync();

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> ClearCartAsync(int userId)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null || !cart.CartItems.Any())
            {
                return true; // Already empty
            }

            try
            {
                _context.CartItems.RemoveRange(cart.CartItems);
                cart.UpdatedAt = DateTime.Now;
                _context.Carts.Update(cart);
                await _context.SaveChangesAsync();

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<(int TotalItems, decimal TotalAmount)> GetCartStatsAsync(int userId)
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

        public async Task<Order> CheckoutAsync(int userId, CheckoutViewModel checkoutData)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null || !cart.CartItems.Any())
            {
                throw new InvalidOperationException("Giỏ hàng trống");
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var order = new Order
                {
                    UserId = userId,
                    OrderDate = DateTime.Now,
                    Status = "Pending",
                    TotalAmount = cart.CartItems.Sum(ci => ci.Product.Price * ci.Quantity)
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                foreach (var cartItem in cart.CartItems)
                {
                    var product = cartItem.Product;

                    if (product == null || !product.IsActive.GetValueOrDefault() || product.StockQuantity < cartItem.Quantity)
                    {
                        throw new InvalidOperationException($"Sản phẩm '{product?.ProductName}' không có đủ hàng trong kho.");
                    }

                    var orderItem = new OrderItem
                    {
                        OrderId = order.Id,
                        ProductId = cartItem.ProductId,
                        Quantity = cartItem.Quantity,
                        UnitPrice = product.Price
                    };

                    _context.OrderItems.Add(orderItem);
                    product.StockQuantity -= cartItem.Quantity;
                }

                _context.CartItems.RemoveRange(cart.CartItems);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return order;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private async Task<Cart> GetOrCreateUserCartAsync(int userId)
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
    }
}
