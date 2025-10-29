namespace GOG.API.Models
{
    public class Task
    {
        public int TaskId { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = "Available"; // Available, Assigned, Completed
        public string? VolunteerId { get; set; } // Nullable - can be unassigned
        public string Category { get; set; } = string.Empty; // Natural Disaster, Healthcare, Education, etc.
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation property
        public virtual ApplicationUser? Volunteer { get; set; }
    }
}
