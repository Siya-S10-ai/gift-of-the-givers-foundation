using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using GOG.API.Models;

namespace GOG.API.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<IncidentReport> IncidentReports { get; set; }
        public DbSet<Models.Task> Tasks { get; set; }
        public DbSet<Donation> Donations { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Configure ApplicationUser relationships
            builder.Entity<ApplicationUser>()
                .HasMany(u => u.IncidentReports)
                .WithOne(r => r.User)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<ApplicationUser>()
                .HasMany(u => u.Tasks)
                .WithOne(t => t.Volunteer)
                .HasForeignKey(t => t.VolunteerId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.Entity<ApplicationUser>()
                .HasMany(u => u.Donations)
                .WithOne(d => d.User)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure IncidentReport
            builder.Entity<IncidentReport>()
                .HasKey(r => r.ReportId);

            builder.Entity<IncidentReport>()
                .Property(r => r.ReportId)
                .ValueGeneratedOnAdd();

            // Configure Task
            builder.Entity<Models.Task>()
                .HasKey(t => t.TaskId);

            builder.Entity<Models.Task>()
                .Property(t => t.TaskId)
                .ValueGeneratedOnAdd();

            // Configure Donation
            builder.Entity<Donation>()
                .HasKey(d => d.DonationId);

            builder.Entity<Donation>()
                .Property(d => d.DonationId)
                .ValueGeneratedOnAdd();

            builder.Entity<Donation>()
                .Property(d => d.Amount)
                .HasColumnType("decimal(18,2)");
        }
    }
}
