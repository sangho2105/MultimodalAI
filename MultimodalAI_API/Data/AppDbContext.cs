using Microsoft.EntityFrameworkCore;
using MultimodalAI_API.Entities;

namespace MultimodalAI_API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) :base(options)
        { 
        }

        public DbSet<Product> Products => Set<Product>();
        public DbSet<Inspector> Inspectors => Set<Inspector>();
        public DbSet<DefectCategory> DefectCategories => Set<DefectCategory>();
        public DbSet<InspectionReport> InspectionReports => Set<InspectionReport>(); 
    }
}
