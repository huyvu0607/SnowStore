namespace ClothingStore.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string email, string subject, string htmlMessage);
        Task SendPasswordResetEmailAsync(string email, string resetLink);
    }
}
