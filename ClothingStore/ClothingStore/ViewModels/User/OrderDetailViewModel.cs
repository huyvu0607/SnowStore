using ClothingStore.Controllers;

namespace ClothingStore.ViewModels.User
{
    public class OrderDetailViewModel
    {
        public string Id { get; set; } = "";
        public DateTime OrderDate { get; set; }
        public string Status { get; set; } = "";
        public decimal TotalAmount { get; set; }
        public string CustomerName { get; set; } = "";
        public string CustomerEmail { get; set; } = "";
        public string CustomerPhone { get; set; } = "";
        public List<OrderItemViewModel> Items { get; set; } = new List<OrderItemViewModel>();
    }
}
