namespace GOG.API.Models
{
    public class Donation
    {
        public int DonationId { get; set; }
        public string Category { get; set; } = string.Empty; // Food, Clothing, Medical Supplies, etc.
        public decimal Amount { get; set; }
        public string TransactionReference { get; set; } = string.Empty; // Payment provider reference
        public string UserId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation property
        public virtual ApplicationUser User { get; set; } = null!;
    }
}
