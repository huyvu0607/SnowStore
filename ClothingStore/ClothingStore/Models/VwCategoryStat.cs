using System;
using System.Collections.Generic;

namespace ClothingStore.Models;

public partial class VwCategoryStat
{
    public int CategoryId { get; set; }

    public string CategoryName { get; set; } = null!;

    public int? TotalProducts { get; set; }

    public decimal AvgPrice { get; set; }

    public decimal MinPrice { get; set; }

    public decimal MaxPrice { get; set; }

    public int TotalStock { get; set; }
}
