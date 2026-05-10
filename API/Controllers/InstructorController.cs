using System.Security.Claims;
using API.Data;
using API.Entities;
using API.Enums;
using API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InstructorController(WebContext context) : ControllerBase
    {
        [HttpGet("{id}")]
        public async Task<IActionResult> GetInstructorProfile(int id)
        {
            var instructor = await context.Users
                .Where(u => u.Id == id && u.Role == UserRole.Instructor)
                .Select(u => new
                {
                    u.Id,
                    u.FirstName,
                    u.LastName,
                    u.Bio,
                    u.ProfileImageUrl,
                    u.GithubUrl,
                    u.TwitterUrl,
                    u.LinkedInUrl,
                    u.YoutubeUrl,
                    u.WebsiteUrl,
                    u.Major,


                    Courses = u.CoursesCreated
                        .Where(c => c.IsPublished)
                        .Select(c => new
                        {
                            c.Id,
                            c.Title,
                            c.ThumbnailUrl,
                            c.Description,
                            c.Price,
                            c.Level,
                            c.ShortDescription,
                            
                            Rating = c.Reviews.Any()
                                ? c.Reviews.Average(r => r.Rating)
                                : 0,

                            TotalLessons = c.Sections
                                .SelectMany(s => s.Lessons)
                                .Count(),

                            TotalDuration = c.Sections
                                .SelectMany(s => s.Lessons)
                                .Sum(l => (int?)l.DurationInMinutes) ?? 0,
                        }).ToList(),


                    TotalCourses = u.CoursesCreated.Count(c => c.IsPublished),
                    TotalStudents = u.CoursesCreated.Sum(c => c.Enrollments.Count), 
                    TotalReviewers = u.CoursesCreated
                        .SelectMany(c => c.Reviews)
                        .Select(r => r.UserId)
                        .Distinct()
                        .Count(),


                    AverageRating = u.CoursesCreated
                    .SelectMany(c => c.Reviews)
                    .Any()
                    ? u.CoursesCreated.SelectMany(c => c.Reviews).Average(r => r.Rating)
                    : 0
                })
                .FirstOrDefaultAsync();

            if (instructor == null)
                return NotFound();

            return Ok(instructor);
        }
    }
}
