using System.Security.Claims;
using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLitePCL;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WishlistController : ControllerBase
    {
        private readonly WebContext context;

        public WishlistController(WebContext context)
        {
            this.context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetWishList()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var data = await context.Wishlists
                .Where(w => w.UserId == userId)
                .Include(w => w.Course)
                .Select(w => new
                {
                    courseId = w.CourseId,
                    Course = new
                    {
                        title = w.Course.Title,
                        thumbnailUrl = w.Course.ThumbnailUrl
                    }
                })
                .ToListAsync();

            return Ok(data);
        }

        [HttpPost("{courseId}")]
        public async Task<IActionResult> Add(int courseId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var exists = await context.Wishlists
                .AnyAsync(w => w.UserId == userId && w.CourseId == courseId);

            if (exists)
                return BadRequest("Already in wishlist");

            context.Wishlists.Add(new Wishlist
            {
                UserId = userId,
                CourseId = courseId
            });

            await context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("{courseId}")]
        public async Task<IActionResult> Remove (int courseId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var item = await context.Wishlists
                .FirstOrDefaultAsync(w => w.UserId == userId && w.CourseId == courseId);

            if (item == null)
                return NotFound();

            context.Wishlists.Remove(item);
            await context.SaveChangesAsync();

            return Ok();
        }

    }
}
