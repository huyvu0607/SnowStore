using ClothingStore.Models;
using ClothingStore.ViewModels.Cart;

namespace ClothingStore.Services
{
    public interface ICartService
    {
        Task<CartViewModel> GetUserCartAsync(int userId);
        Task<bool> AddToCartAsync(int userId, int productId, int quantity);
        Task<bool> UpdateQuantityAsync(int userId, int cartItemId, int quantity);
        Task<bool> RemoveFromCartAsync(int userId, int cartItemId);
        Task<bool> ClearCartAsync(int userId);
        Task<(int TotalItems, decimal TotalAmount)> GetCartStatsAsync(int userId);
        Task<Order> CheckoutAsync(int userId, CheckoutViewModel checkoutData);
    }
}
