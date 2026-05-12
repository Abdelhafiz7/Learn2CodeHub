using System.IO.Compression;
using System.Security.Claims;
using API.Data;
using API.Data.Migrations;
using API.Entities;
using API.Enums;
using API.Models;
using API.Helpers;
using API.Services;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController(WebContext context, EmailService emailService) : ControllerBase
    {
        [HttpGet("latestReviews")]
        [Authorize(Roles = "Instructor")]
        public async Task<ActionResult<List<ReviewDto>>> GetLatestReviews()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var reviews = await context.Reviews
                .Where(r => r.Course != null && r.Course.InstructorId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .Take(5)
                .Select(r => new
                {
                    id = r.Id,
                    studentName = r.User.FirstName + " " + r.User.LastName,
                    courseTitle = r.Course.Title,
                    rating = r.Rating,
                    comment = r.Comment,
                    createdAt = r.CreatedAt,
                    instructorReply = r.InstructorReply,

                    courseThumbnail = r.Course.ThumbnailUrl,

                    lessonTitle = r.Lesson != null ? r.Lesson.Title : null,
                    sectionTitle = r.Section != null ? r.Section.Title : null
                })
                    .ToListAsync();

            return Ok(reviews);
        }

        [HttpPost("reply/{reviewId}")]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> ReplyToReview(int reviewId, [FromBody] string replay)
        {
            var review = await context.Reviews.FindAsync(reviewId);

            if (review == null)
                return NotFound("Review not found");

            review.InstructorReply = replay;

            await context.SaveChangesAsync();

            return Ok(new { message = "Reply sent successfully" });
        }

        [HttpGet("stats")]
        [Authorize(Roles = "Instructor")]
        public async Task<ActionResult> GetInstructorStats()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null)
                return Unauthorized();

            int instructorId = int.Parse(userId);

            var courses = await context.Courses
                .Where(c => c.InstructorId == instructorId)
                .Select(c => c.Id)
                .ToListAsync();

            var reviews = await context.Reviews
                .Where(r => r.Course.InstructorId == instructorId)
                .ToListAsync();

            var totalRevenue = await context.Enrollments
                .Where(e => courses.Contains(e.CourseId))
                .Join(
                    context.Courses,
                    e => e.CourseId,
                    c => c.Id,
                    (e, c) => (decimal?)c.Price
                )
                .SumAsync() ?? 0;

            var averageRating = await context.Reviews
                .Where(r => r.Course.InstructorId == instructorId)
                .Select(r => (double?)r.Rating)
                .AverageAsync() ?? 0;

            var totalReviews = reviews.Count();
            var totalCourses = courses.Count();
            var totalStudents = await context.Enrollments
                .Where(e => e.Course.InstructorId == instructorId)
                .CountAsync();

            var publishedCourses = await context.Courses
                .CountAsync(c => c.InstructorId == instructorId && c.IsPublished);


            var now = DateTime.UtcNow;

            var startOfThisMonth = new DateTime(now.Year, now.Month, 1);
            var startOfLastMonth = startOfThisMonth.AddMonths(-1);

            var thisMonthRevenue = await context.Enrollments
                .Where(e => courses.Contains(e.CourseId) && e.EnrolledAt >= startOfThisMonth)
                .Join(context.Courses,
                    e => e.CourseId,
                    c => c.Id,
                    (e, c) => (decimal?)c.Price)
                .SumAsync() ?? 0;

            var lastMonthRevenue = await context.Enrollments
                .Where(e => courses.Contains(e.CourseId) &&
                            e.EnrolledAt >= startOfLastMonth &&
                            e.EnrolledAt < startOfThisMonth)
                .Join(context.Courses,
                    e => e.CourseId,
                    c => c.Id,
                    (e, c) => (decimal?)c.Price)
                .SumAsync() ?? 0;

            double growth = lastMonthRevenue == 0 && thisMonthRevenue > 0
                ? 100
                : lastMonthRevenue > 0
                    ? ((double)(thisMonthRevenue - lastMonthRevenue) / (double)lastMonthRevenue) * 100
                    : 0;


            var thisMonthStudents = await context.Enrollments
                .Where(e => e.Course.InstructorId == instructorId && e.EnrolledAt >= startOfThisMonth)
                .CountAsync();

            var lastMonthStudents = await context.Enrollments
                .Where(e => e.Course.InstructorId == instructorId &&
                            e.EnrolledAt >= startOfLastMonth &&
                            e.EnrolledAt < startOfThisMonth)
                .CountAsync();

            double studentGrowth = lastMonthStudents == 0 && thisMonthStudents > 0
                ? 100
                : lastMonthStudents > 0
                    ? ((double)(thisMonthStudents - lastMonthStudents) / (double)lastMonthStudents) * 100
                    : 0;

            var instructorRatings = await context.Courses
                .GroupBy(c => c.InstructorId)
                .Select(g => new
                {
                    InstructorId = g.Key,
                    AvgRating = context.Reviews
                        .Where(r => g.Select(c => c.Id).Contains(r.CourseId))
                        .Select(r => (double?)r.Rating)
                        .Average() ?? 0
                })
                .ToListAsync();

            var currentInstructor = instructorRatings
                .FirstOrDefault(i => i.InstructorId == instructorId);

            double percentile = 0;

            if (currentInstructor != null && instructorRatings.Count > 0)
            {
                var betterThan = instructorRatings
                    .Count(i => i.AvgRating < currentInstructor.AvgRating);

                percentile = (double)betterThan / instructorRatings.Count * 100;
            }


            return Ok(new
            {
                totalRevenue,
                averageRating = Math.Round(averageRating, 1),
                totalReviews,
                totalStudents,
                totalCourses,
                publishedCourses,
                growth = Math.Round(growth, 1),
                studentGrowth = Math.Round(studentGrowth, 1),
                percentile = Math.Round(percentile, 1)
            });
        }

        [HttpGet("latestEnrollment")]
        [Authorize(Roles = "Instructor")]
        public async Task<ActionResult<List<CourseDto>>> GetLatestEnrollment()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var enrollments = await context.Enrollments
                .Where(e => e.Course.InstructorId == userId)
                .Include(e => e.User)
                .Include(e => e.Course)
                .OrderByDescending(e => e.EnrolledAt)
                .Take(5)
                .Select(e => new
                {
                    studentName = e.User.FirstName + " " + e.User.LastName,
                    courseTitle = e.Course.Title,
                    createdAt = e.EnrolledAt
                })
                .ToListAsync();

            return Ok(enrollments);
        }


        // Admin Dashboard
        [HttpGet("admin/users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminUsers(int page = 1, int pageSize = 20, string? search = null)
        {
            var query = context.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.ToLower();
                query = query.Where(u =>
                    u.FirstName.ToLower().Contains(search) ||
                    u.LastName.ToLower().Contains(search) ||
                    u.Email.ToLower().Contains(search)
                );
            }

            var totalCount = await query.CountAsync();

            var users = await query
                .OrderByDescending(u => u.CreateAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new
                {
                    id = u.Id,
                    firstName = u.FirstName,
                    lastName = u.LastName,
                    email = u.Email,
                    role = u.Role.ToString(),
                    isActive = u.isActive,
                    emailConfirmed = u.EmailConfirmed,
                    createdAt = u.CreateAt

                })
                .ToListAsync();

            return Ok(new
            {
                data = users,
                totalCount,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            });
        }

        [HttpGet("admin/courses")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminCourses(int page = 1, int pageSize = 10, string? search = null, string? category = null)
        {
            var query = context.Courses.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(c => c.Title.ToLower().Contains(search.ToLower()));

            if (!string.IsNullOrWhiteSpace(category))
                query = query.Where(c => c.Category.Name == category);

            var totalCount = await query.CountAsync();

            var courses = await query
                .Include(c => c.Instructor)
                .OrderByDescending(c => c.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new
                {
                    id = c.Id,
                    title = c.Title,
                    thumbnailUrl = c.ThumbnailUrl,
                    instructor = new
                    {
                        firstName = c.Instructor.FirstName,
                        lastName = c.Instructor.LastName
                    },
                    status = c.IsPublished ? "Published" : "Draft",
                    enrollmentCount = c.Enrollments.Count,
                    price = c.Price,
                    revenue = (decimal?)c.Enrollments.Count * c.Price ?? 0,
                    level = c.Level,
                    category = c.Category.Name,
                    rating = c.Reviews.Any()
                        ? Math.Round(c.Reviews.Average(r => r.Rating), 1)
                        : 0
                })
                .ToListAsync();

            return Ok(new { data = courses, totalCount });
        }


        [HttpGet("admin/stats")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminStats()
        {
            var totalUsers = await context.Users.CountAsync();

            var totalInstructors = await context.Users
                .CountAsync(u => u.Role == UserRole.Instructor);

            var totalCourses = await context.Courses.CountAsync();

            var publishedCourses = await context.Courses
                .CountAsync(c => c.IsPublished);

            var totalEnrollments = await context.Enrollments.CountAsync();

            var totalRevenue = await context.Enrollments
                .SumAsync(e => (decimal?)e.Course.Price);

            var totalReviews = await context.Reviews.CountAsync();

            var averageRating = await context.Reviews.AnyAsync()
                ? await context.Reviews.AverageAsync(r => r.Rating)
                : 0;

            var newUserThisMonth = await context.Users
                .CountAsync(u => u.CreateAt >= DateTime.UtcNow.AddMonths(-1));

            return Ok(new
            {
                totalUsers,
                totalInstructors,
                totalCourses,
                publishedCourses,
                totalEnrollments,
                totalRevenue,
                totalReviews,
                averageRating,
                newUserThisMonth
            });
        }

        [HttpGet("admin/analytics")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAnalytics()
        {
            var now = DateTime.UtcNow;

            var last6Month = Enumerable.Range(0, 6)
                .Select(i => now.AddMonths(-i))
                .OrderBy(d => d)
                .ToList();

            var revenue = new List<object>();
            var users = new List<object>();
            var enrollment = new List<object>();

            foreach (var month in last6Month)
            {
                var start = new DateTime(month.Year, month.Month, 1);
                var end = start.AddMonths(1);

                var monthlyRevenue = await context.Enrollments
                    .Where(e => e.EnrolledAt >= start && e.EnrolledAt < end)
                    .Join(context.Courses,
                        e => e.CourseId,
                        e => e.Id,
                        (e, c) => (decimal?)c.Price)
                    .SumAsync() ?? 0;

                var monthlyUsers = await context.Users
                    .Where(u => u.CreateAt >= start && u.CreateAt < end)
                    .CountAsync();

                var monthlyEnrollments = await context.Enrollments
                    .Where(e => e.EnrolledAt >= start && e.EnrolledAt < end)
                    .CountAsync();


                revenue.Add(new
                {
                    month = start.ToString("MMM"),
                    value = monthlyRevenue
                });

                users.Add(new
                {
                    month = start.ToString("MMM"),
                    value = monthlyUsers
                });

                enrollment.Add(new
                {
                    month = start.ToString("MMM"),
                    value = monthlyEnrollments
                });
            }

            return Ok(new
            {
                revenue,
                users,
                enrollment
            });

        }

        [HttpGet("admin/top-courses")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetTopCourses()
        {
            var courses = await context.Courses
                .Where(c => c.IsPublished)
                .Select(c => new
                {
                    c.Id,
                    c.Title,
                    c.ThumbnailUrl,

                    student = c.Enrollments.Count(),

                    Revenue = c.Enrollments.Count() * c.Price,

                    Rating = c.Reviews.Any()
                        ? c.Reviews.Average(r => r.Rating)
                        : 0,
                })
                .OrderByDescending(c => c.Revenue)
                .Take(5)
                .ToListAsync();

            return Ok(courses);
        }

        [HttpGet("admin/low-courses")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetLowCourses()
        {
            var courses = await context.Courses
                .Where(c => c.IsPublished)
                .Select(c => new
                {
                    c.Id,
                    c.Title,
                    c.ThumbnailUrl,

                    Students = c.Enrollments.Count(),
                    Rating = c.Reviews.Any()
                        ? c.Reviews.Average(r => r.Rating)
                        : 0
                })
                .OrderBy(c => c.Students)
                .Take(5)
                .ToListAsync();

            return Ok(courses);
        }

        [HttpGet("admin/top-instructors")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetTopInstructors()
        {
            var instructors = await context.Users
                .Where(u => u.Role == UserRole.Instructor)
                .Select(u => new
                {
                    u.Id,
                    Name = u.FirstName + " " + u.LastName,

                    TotalStudents = u.CoursesCreated
                        .SelectMany(c => c.Enrollments)
                        .Count(),

                    TotalRevenue = u.CoursesCreated
                        .SelectMany(c => c.Enrollments)
                        .Sum(e => (decimal?)e.Course.Price) ?? 0,

                    AverageRating = u.CoursesCreated
                        .SelectMany(c => c.Reviews)
                        .Any()
                        ? u.CoursesCreated.SelectMany(c => c.Reviews).Average(r => r.Rating)
                        : 0
                })
                .OrderByDescending(i => i.TotalRevenue)
                .ThenByDescending(i => i.AverageRating)
                .Take(5)
                .ToListAsync();

            return Ok(instructors);
        }

        [HttpGet("admin/activity")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminActivity()
        {
            var activities = new List<object>();

            var users = await context.Users
                .OrderByDescending(u => u.CreateAt)
                .Take(5)
                .Select(u => new
                {
                    type = "user",
                    message = $"{u.FirstName} {u.LastName} joined the platform",
                    date = u.CreateAt
                })
                .ToListAsync();

            var enrollments = await context.Enrollments
                .Include(e => e.User)
                .Include(e => e.Course)
                .OrderByDescending(e => e.EnrolledAt)
                .Take(5)
                .Select(e => new
                {
                    type = "enrollment",
                    message = $"{e.User.FirstName} enrolled in {e.Course.Title}",
                    date = e.EnrolledAt
                })
                .ToListAsync();

            var reviews = await context.Reviews
                .Include(r => r.User)
                .Include(r => r.Course)
                .OrderByDescending(r => r.CreatedAt)
                .Take(5)
                .Select(r => new
                {
                    type = "review",
                    message = $"{r.User.FirstName} rated {r.Course.Title} ({r.Rating}★)",
                    date = r.CreatedAt
                })
                .ToListAsync();


            activities.AddRange(users);
            activities.AddRange(enrollments);
            activities.AddRange(reviews);

            var sorted = activities
                .OrderByDescending(a => a.GetType().GetProperty("date")!.GetValue(a))
                .Take(10);

            return Ok(sorted);
        }

        [HttpDelete("admin/users/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await context.Users.FindAsync(id);

            if (user == null)
                return NotFound();

            context.Users.Remove(user);
            await context.SaveChangesAsync();

            return Ok(new { message = "Users deleted successfully" });
        }

        [HttpPut("admin/users/{id}/role")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] string role)
        {
            var user = await context.Users.FindAsync(id);

            if (user == null)
                return NotFound();

            if (!Enum.TryParse<UserRole>(role, true, out var newRole))
                return BadRequest("Invalid role");

            user.Role = newRole;

            await context.SaveChangesAsync();

            return Ok(new { message = "User role updated successfully" });
        }

        [HttpPatch("admin/users/{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ToggleUserStatus(int id)
        {
            var user = await context.Users.FindAsync(id);

            if (user == null)
                return NotFound();

            user.isActive = !user.isActive;

            await context.SaveChangesAsync();

            try
            {
                if (!user.isActive)
                {
                    await emailService.SendEmailAsync(
                        user.Email,
                        "Your Account Has Been Deactivated",
                        EmailTemplates.GetAccountDeactivatedEmail(user.FirstName)
                    );
                }
                else
                {
                    await emailService.SendEmailAsync(
                        user.Email,
                        "Your Account Has Been Reactivated",
                        EmailTemplates.GetAccountReactivatedEmail(user.FirstName)
                    );
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Email sending failed: {ex.Message}");
            }

            return Ok(new { message = "User status updated successfully" });
        }

        [HttpGet("admin/pending-courses")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPendingCourses()
        {
            var courses = await context.Courses
                .Where(c => c.Status == CourseStatus.PendingReview)
                .Include(c => c.Instructor)
                .Include(c => c.Category)
                .OrderBy(c => c.UpdatedAt)
                .Select(c => new
                {
                    id = c.Id,
                    title = c.Title,
                    thumbnailUrl = c.ThumbnailUrl,
                    category = c.Category.Name,
                    level = c.Level,
                    price = c.Price,
                    submittedAt = c.UpdatedAt,
                    instructor = new
                    {
                        firstName = c.Instructor.FirstName,
                        lastName = c.Instructor.LastName
                    }
                })
                .ToListAsync();

            return Ok(courses);
        }
    }
}
