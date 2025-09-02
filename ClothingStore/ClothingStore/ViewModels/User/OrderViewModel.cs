using ClothingStore.Controllers;

namespace ClothingStore.ViewModels.User
{
    public class OrderViewModel
    {
        public string Id { get; set; } = "";
        public DateTime OrderDate { get; set; }
        public string Status { get; set; } = "";
        public decimal TotalAmount { get; set; }
        public int ItemCount { get; set; }
        public List<OrderItemViewModel> Items { get; set; } = new List<OrderItemViewModel>();
    }
}
