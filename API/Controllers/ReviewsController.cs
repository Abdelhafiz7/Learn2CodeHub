using System.IO.Compression;
using System.Security.Claims;
using API.Data;
using API.Entities;
using API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController(WebContext context) : ControllerBase
    {
        [HttpPost]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> CraeteOrUpdateReview(ReviewDto reviewDto)
        {
            if (reviewDto.Rating < 1 || reviewDto.Rating > 5)
                return BadRequest("Rating must be between 1 and 5.");

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var courseExists = await context.Courses.AnyAsync(c => c.Id == reviewDto.CourseId);
            if (!courseExists)
                return NotFound("Course not found");

            var isEnrolled = await context.Enrollments
                .AnyAsync(e => e.UserId == userId && e.CourseId == reviewDto.CourseId);
            if (!isEnrolled)
                return BadRequest("You must be enrolled in the course to leave a review");

            var review = await context.Reviews
                .FirstOrDefaultAsync(r => r.UserId == userId && r.CourseId == reviewDto.CourseId);

            if (review == null)
            {
                review = new Review
                {
                    UserId = userId,
                    CourseId = reviewDto.CourseId,
                    Rating = reviewDto.Rating,
                    Comment = reviewDto.Comment,
                    CreatedAt = DateTime.UtcNow
                };

                context.Reviews.Add(review);
            }
            else
            {
                review.Rating = reviewDto.Rating;
                review.Comment = reviewDto.Comment;
                review.CreatedAt = DateTime.UtcNow;
            }

            await context.SaveChangesAsync();

            return Ok(new ReviewDto
            {
                Id = review.Id,
                CourseId = review.CourseId,
                Rating = review.Rating,
                Comment = review.Comment,
                UserName = User.Identity!.Name!,
                CreatedAt = review.CreatedAt
            });
        }

        [HttpGet("{courseId}")]
        public async Task<ActionResult<List<ReviewDto>>> GetCourseReviews(int courseId)
        {
            var reviews = await context.Reviews
                .Where(r => r.CourseId == courseId)
                .Include(r => r.User)
                .Select(r => new ReviewDto
                {
                    Id = r.Id,
                    CourseId = r.CourseId,
                    Rating = r.Rating,
                    Comment = r.Comment ?? string.Empty,
                    UserName = r.User.FirstName + " " + r.User.LastName,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();

            return Ok(reviews);
        }

        [HttpDelete("{courseId}")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> DeleteReview(int courseId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var review = await context.Reviews
                .FirstOrDefaultAsync(r => r.UserId == userId && r.CourseId == courseId);

            if (review == null)
                return NotFound(review);

            context.Reviews.Remove(review);
            await context.SaveChangesAsync();

            return Ok("Review deleted successfully");
        }

    }
}
