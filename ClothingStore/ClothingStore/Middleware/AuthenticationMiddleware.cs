namespace ClothingStore.Middleware
{
    public class AuthenticationMiddleware
    {
        private readonly RequestDelegate _next;

        public AuthenticationMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Thêm logic xử lý authentication tùy chỉnh nếu cần
            // Ví dụ: log user activity, check account status, etc.

            await _next(context);
        }
    }
}
