namespace GOG.API.DTOs
{
    public class DonationDto
    {
        public int DonationId { get; set; }
        public string Category { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string TransactionReference { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string UserName { get; set; } = string.Empty;
    }

    public class CreateDonationDto
    {
        public string Category { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string TransactionReference { get; set; } = string.Empty;
    }

    public class PaymentIntentDto
    {
        public decimal Amount { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Currency { get; set; } = "ZAR";
    }
}
