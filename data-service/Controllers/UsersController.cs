using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DataService.Data;
using DataService.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace DataService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("profile")]
    public async Task<ActionResult<User>> GetProfile()
    {
        var googleId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                        ?? User.FindFirst("sub")?.Value;
        
        var user = await _context.Users.FirstOrDefaultAsync(u => u.GoogleId == googleId);
        if (user == null) return NotFound();
        
        return user;
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UserUpdateDto dto)
    {
        var googleId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                        ?? User.FindFirst("sub")?.Value;
        
        var user = await _context.Users.FirstOrDefaultAsync(u => u.GoogleId == googleId);
        if (user == null) return NotFound();

        user.FullName = dto.FullName;
        user.PictureUrl = dto.PictureUrl;
        
        // Potential for more fields later
        // user.Preferences = dto.Preferences;

        await _context.SaveChangesAsync();
        return Ok(new { user.Email, user.FullName, user.PictureUrl, user.Role });
    }
}

public record UserUpdateDto(string FullName, string PictureUrl);
