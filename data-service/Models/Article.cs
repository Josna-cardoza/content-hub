namespace DataService.Models;

public class Article
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    
    // SEO fields
    public string Slug { get; set; } = string.Empty;

    // Recommendation/Metric fields
    public int ViewCount { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Foreign Key to Author
    public int AuthorId { get; set; }
    public User Author { get; set; } = null!;

    // Many-to-Many relationships
    public List<Tag> Tags { get; set; } = new();
    public List<Category> Categories { get; set; } = new();
}
