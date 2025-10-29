namespace GOG.API.Models
{
    public class IncidentReport
    {
        public int ReportId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string ReportType { get; set; } = string.Empty; // Natural Disaster, Healthcare, Education, etc.
        public string? ImageUrl { get; set; } // URL to Azure Blob Storage
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation property
        public virtual ApplicationUser User { get; set; } = null!;
    }
}
