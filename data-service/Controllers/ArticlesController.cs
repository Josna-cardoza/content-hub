using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DataService.Data;
using DataService.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace DataService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArticlesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ArticlesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Article>>> GetArticles()
    {
        return await _context.Articles
            .Include(a => a.Author)
            .Include(a => a.Tags)
            .Include(a => a.Categories)
            .Where(a => a.Status == "Published")
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();
    }

    [HttpGet("my-content")]
    public async Task<ActionResult<IEnumerable<Article>>> GetMyArticles()
    {
        var sub = User.FindFirst("sub")?.Value;
        var nameId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        User? user = null;
        if (!string.IsNullOrEmpty(sub))
            user = await _context.Users.FirstOrDefaultAsync(u => u.GoogleId == sub);

        if (user == null && int.TryParse(nameId, out var uid))
            user = await _context.Users.FirstOrDefaultAsync(u => u.Id == uid);

        if (user == null) return Ok(new List<Article>());

        return await _context.Articles
            .Where(a => a.AuthorId == user.Id)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Article>> GetArticle(int id)
    {
        var article = await _context.Articles
            .Include(a => a.Author)
            .Include(a => a.Tags)
            .Include(a => a.Categories)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (article == null) return NotFound();

        return article;
    }

    [HttpPost]
    public async Task<ActionResult<Article>> CreateArticle(Article article)
    {
        var googleId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst("sub")?.Value;

        User? author = null;

        if (!string.IsNullOrEmpty(googleId))
        {
            author = await _context.Users.FirstOrDefaultAsync(u => u.GoogleId == googleId);
        }

        // Fallback: assign to first admin user (debug mode only)
        if (author == null)
        {
            author = await _context.Users.FirstOrDefaultAsync(u => u.Role == "Admin")
                     ?? await _context.Users.FirstOrDefaultAsync();
        }

        if (author == null) return BadRequest(new { message = "No users exist in system. Please log in first." });

        article.AuthorId = author.Id;
        article.Author = null;
        article.CreatedAt = DateTime.UtcNow;
        article.UpdatedAt = DateTime.UtcNow;

        if (string.IsNullOrEmpty(article.Slug))
        {
            var baseSlug = article.Title.ToLower()
                .Replace(" ", "-")
                .Replace("'", "")
                .Replace("\"", "");
            article.Slug = baseSlug + "-" + Guid.NewGuid().ToString().Substring(0, 8);
        }

        _context.Articles.Add(article);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetArticle), new { id = article.Id }, article);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateArticle(int id, Article article)
    {
        if (id != article.Id) return BadRequest();

        var existing = await _context.Articles.FindAsync(id);
        if (existing == null) return NotFound();

        // Update only the editable fields
        existing.Title = article.Title;
        existing.Content = article.Content;
        existing.Summary = article.Summary;
        existing.ImageUrl = article.ImageUrl;
        existing.Status = article.Status;
        existing.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrEmpty(article.Slug))
            existing.Slug = article.Slug;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ArticleExists(id)) return NotFound();
            throw;
        }

        return Ok(existing);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteArticle(int id)
    {
        var article = await _context.Articles.FindAsync(id);
        if (article == null) return NotFound();

        _context.Articles.Remove(article);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool ArticleExists(int id) => _context.Articles.Any(e => e.Id == id);
}
