using System;
using System.Collections.Generic;

namespace ClothingStore.Models;

public partial class VwProductDetail
{
    public int ProductId { get; set; }

    public string ProductName { get; set; } = null!;

    public string CategoryName { get; set; } = null!;

    public string? Description { get; set; }

    public decimal Price { get; set; }

    public string? Size { get; set; }

    public string? Color { get; set; }

    public string? Material { get; set; }

    public int? StockQuantity { get; set; }

    public bool? IsActive { get; set; }

    public int? TotalImages { get; set; }

    public string? MainImage { get; set; }
}
