namespace GOG.API.DTOs
{
    public class TaskDto
    {
        public int TaskId { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? VolunteerId { get; set; }
        public string Category { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string? VolunteerName { get; set; }
    }

    public class CreateTaskDto
    {
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
    }

    public class UpdateTaskDto
    {
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? VolunteerId { get; set; }
        public string Category { get; set; } = string.Empty;
    }

    public class AssignTaskDto
    {
        public string VolunteerId { get; set; } = string.Empty;
    }
}
