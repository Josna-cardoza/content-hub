using DataService.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure PostgreSQL Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Host=localhost;Database=contentdb;Username=admin;Password=password123";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ==== SEED DATA BEGIN ====
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.EnsureCreated(); // Creates DB if not exists
    
    if (!context.Users.Any())
    {
        var adminUser = new DataService.Models.User {
            GoogleId = "seed-admin-id",
            Email = "admin@example.com",
            FullName = "Administrator User",
            Role = "Admin"
        };
        context.Users.Add(adminUser);
        context.SaveChanges();

        if (!context.Articles.Any())
        {
            context.Articles.AddRange(
                new DataService.Models.Article {
                    Title = "Understanding the Cosmos",
                    Content = "A deep dive into astrophysics and the known universe. We explore stars, galaxies, and the mysteries of dark matter.",
                    Summary = "Exploring stars and galaxies.",
                    Slug = "understanding-cosmos",
                    AuthorId = adminUser.Id,
                    ImageUrl = "https://images.unsplash.com/photo-1462331940025-496dfbfc7564",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new DataService.Models.Article {
                    Title = "The Rise of Quantum Computing",
                    Content = "Quantum computing is taking the world by storm. In this article, we cover the basics of qubits, entanglement, and future applications.",
                    Summary = "An intro to qubits and entanglement.",
                    Slug = "quantum-computing",
                    AuthorId = adminUser.Id,
                    ImageUrl = "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new DataService.Models.Article {
                    Title = "Modern Web Development",
                    Content = "Building fast and scalable web platforms using React and .NET. A look at the modern tech stack in 2026.",
                    Summary = "Web tech stack in 2026.",
                    Slug = "modern-web-dev",
                    AuthorId = adminUser.Id,
                    ImageUrl = "https://images.unsplash.com/photo-1547658719-da2b51169166",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            );
            context.SaveChanges();
        }
    }
}
// ==== SEED DATA END ====

app.UseAuthorization();

app.MapControllers();

app.Run();
