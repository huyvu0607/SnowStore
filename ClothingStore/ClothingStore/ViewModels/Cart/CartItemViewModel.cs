namespace ClothingStore.ViewModels.Cart
{
    public class CartItemViewModel
    {
        public int Id { get; set; } // CartItem ID
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public int StockQuantity { get; set; }
        public bool IsActive { get; set; } = true;
        public decimal SubTotal => Price * Quantity;
        public DateTime AddedAt { get; set; }

        // Thông tin bổ sung của sản phẩm
        public string? Size { get; set; }
        public string? Color { get; set; }
        public string? Material { get; set; }
    }
}
