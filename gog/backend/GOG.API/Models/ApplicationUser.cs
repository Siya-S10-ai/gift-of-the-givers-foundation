using Microsoft.AspNetCore.Identity;

namespace GOG.API.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty; // Admin, Reporter, Volunteer
        
        // Navigation properties
        public virtual ICollection<IncidentReport> IncidentReports { get; set; } = new List<IncidentReport>();
        public virtual ICollection<Task> Tasks { get; set; } = new List<Task>();
        public virtual ICollection<Donation> Donations { get; set; } = new List<Donation>();
    }
}
