using System.ComponentModel.DataAnnotations;

namespace DataService.Models;

public class Comment
{
    public int Id { get; set; }
    
    [Required]
    public string Content { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Foreign Key to Article
    public int ArticleId { get; set; }
    public Article? Article { get; set; }

    // Foreign Key to User (Nullable for Anonymous if needed, but per plan Readers must login)
    // However, user said "Users if not logged in use Anonyms name".
    // I will allow UserId to be null for Anonymous comments.
    public int? UserId { get; set; }
    public User? User { get; set; }

    // If User is null, this will hold "Anonymous"
    public string GuestName { get; set; } = "Anonymous";
}
