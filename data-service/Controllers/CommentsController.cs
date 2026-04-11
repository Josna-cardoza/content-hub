using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DataService.Data;
using DataService.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace DataService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CommentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public System.Text.Json.JsonSerializerOptions _jsonOptions = new() {
        ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles
    };

    public CommentsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("article/{articleId}")]
    public async Task<ActionResult<IEnumerable<Comment>>> GetCommentsByArticle(int articleId)
    {
        return await _context.Comments
            .Include(c => c.User)
            .Where(c => c.ArticleId == articleId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Comment>> CreateComment(Comment comment)
    {
        // If user is authenticated, associate with user
        if (User.Identity?.IsAuthenticated == true)
        {
            var googleId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                            ?? User.FindFirst("sub")?.Value;
            var user = await _context.Users.FirstOrDefaultAsync(u => u.GoogleId == googleId);
            if (user != null)
            {
                comment.UserId = user.Id;
                comment.GuestName = user.FullName;
            }
        }
        else 
        {
            // Anonymous comment
            comment.UserId = null;
            if (string.IsNullOrEmpty(comment.GuestName)) {
                comment.GuestName = "Anonymous";
            }
        }

        comment.CreatedAt = DateTime.UtcNow;
        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCommentsByArticle), new { articleId = comment.ArticleId }, comment);
    }
}
