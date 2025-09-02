using ClothingStore.Models;

namespace ClothingStore.Services
{
    public interface IJwtService
    {
        string GenerateAccessToken(User user);
        bool ValidateToken(string token);
    }
}
