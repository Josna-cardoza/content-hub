namespace DataService.Models;

public class User
{
    public int Id { get; set; }
    public string GoogleId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string PictureUrl { get; set; } = string.Empty;
    
    // Roles: Reader, Creator, Admin
    public string Role { get; set; } = "Reader";

    // Captured Data for Recommendations Context
    public DateTime LastLoginAt { get; set; } = DateTime.UtcNow;
    public string Preferences { get; set; } = string.Empty; // JSON string or related table
    
    public List<Article> Articles { get; set; } = new();
}
