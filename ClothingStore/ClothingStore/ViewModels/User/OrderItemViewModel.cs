﻿namespace ClothingStore.ViewModels.User
{
    public class OrderItemViewModel
    {
        public string ProductId { get; set; } = "";
        public string ProductName { get; set; } = "";
        public string ImageUrl { get; set; } = "";
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string CategoryName { get; set; } = "";
    }
}
