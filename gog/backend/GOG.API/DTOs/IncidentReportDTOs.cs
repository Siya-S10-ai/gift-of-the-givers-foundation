namespace GOG.API.DTOs
{
    public class IncidentReportDto
    {
        public int ReportId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string ReportType { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public string UserName { get; set; } = string.Empty;
    }

    public class CreateIncidentReportDto
    {
        public string Description { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string ReportType { get; set; } = string.Empty;
        public IFormFile? Image { get; set; }
    }

    public class UpdateIncidentReportDto
    {
        public string Description { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string ReportType { get; set; } = string.Empty;
    }
}
