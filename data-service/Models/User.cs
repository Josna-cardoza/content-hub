namespace DataService.Models;

public class User
{
    public int Id { get; set; }
    public string? GoogleId { get; set; } // null for local-auth users
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string PictureUrl { get; set; } = string.Empty;
    public string? PasswordHash { get; set; } // Nullable for external users (Google/etc)
    
    // Roles: Reader, Creator, Admin
    public string Role { get; set; } = "Reader";

    // Captured Data for Recommendations Context
    public DateTime LastLoginAt { get; set; } = DateTime.UtcNow;
    public string Preferences { get; set; } = string.Empty; // JSON string or related table
    
    public List<Article> Articles { get; set; } = new();
}
