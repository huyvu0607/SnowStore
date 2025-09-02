using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace ClothingStore.Models
{
    [Table("Orders")]
    public class Order
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        // Khóa ngoại tới User
        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        // Thời điểm đặt hàng
        public DateTime OrderDate { get; set; } = DateTime.Now;

        // Trạng thái đơn hàng (Pending, Paid, Shipped, Cancelled...)
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Pending";

        // Tổng tiền
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        // Quan hệ 1 Order có nhiều OrderItem
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
