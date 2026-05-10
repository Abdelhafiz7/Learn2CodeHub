using System.Security.Claims;
using API.Data;
using API.Entities;
using API.Enums;
using API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EnrollmentsController(WebContext context) : ControllerBase
    {
        [HttpPost]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> Enroll(EnrollmentDto enrollmentDto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var courseExists = await context.Courses.AnyAsync(c => c.Id == enrollmentDto.CourseId);
            if (!courseExists)
                return NotFound("Course not found");

            var existingEnrollment = await context.Enrollments
                .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == enrollmentDto.CourseId);

            if (existingEnrollment != null)
            {
                if (existingEnrollment.Status == EnrollmentStatus.Active)
                    return BadRequest("Already enrolled");

                existingEnrollment.Status = EnrollmentStatus.Active;
                existingEnrollment.CompletedAt = null;

                await context.SaveChangesAsync();
                return Ok("Re-enrolled successfully");
            }

            var enrollment = new Enrollment
            {
                UserId = userId,
                CourseId = enrollmentDto.CourseId,
                Status = EnrollmentStatus.Active
            };

            context.Enrollments.Add(enrollment);
            await context.SaveChangesAsync();

            return Ok("Enrolled successfully");
        }

        [HttpGet("my-courses")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetMyCourses()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var enrollments = await context.Enrollments
                .Where(e => e.UserId == userId && e.Status != EnrollmentStatus.Cancelled)

                .Include(e => e.Course)
                    .ThenInclude(c => c.Sections)
                        .ThenInclude(s => s.Lessons)

                .Include(e => e.Course)
                    .ThenInclude(c => c.Instructor)

                .Select(e => new
                {
                    id = e.Id,
                    courseId = e.CourseId,
                    progress = e.Progress,
                    lastAccessedAt = e.LastAccessedAt,
                    lastLessonId = e.LastLessonId,

                    course = new
                    {

                        title = e.Course.Title,
                        thumbnailUrl = e.Course.ThumbnailUrl,
                        level = e.Course.Level,

                        totalDuration = e.Course.Sections
                            .SelectMany(s => s.Lessons)
                            .Sum(l => l.DurationInMinutes),

                        totalLessons = e.Course.Sections
                            .SelectMany(s => s.Lessons)
                            .Count(),

                        nextLessonTitle = e.Course.Sections
                            .SelectMany(s => s.Lessons)
                            .Where(l => e.LastLessonId != null && l.Id > e.LastLessonId)
                            .OrderBy(l => l.Id)
                            .Select(l => l.Title)
                            .FirstOrDefault(),

                        instructor = new
                        {
                            firstName = e.Course.Instructor.FirstName,
                            lastName = e.Course.Instructor.LastName
                        }
                    }
                })
                .ToListAsync();

            return Ok(enrollments);
        }

        [HttpPut("complete/{CourseId}")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> CompleteCourse(int courseId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var enrollment = await context.Enrollments
                .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == courseId);

            if (enrollment == null)
                return NotFound("Not enrolled in this course");

            enrollment.Status = EnrollmentStatus.Completed;
            enrollment.CompletedAt = DateTime.UtcNow;

            await context.SaveChangesAsync();

            return Ok("Course marked as completed");
        }

        [HttpDelete("{courseId}")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> CancelEnrollment(int courseId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var enrollment = await context.Enrollments
                .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == courseId);

            if (enrollment == null)
                return NotFound("Enrollment not found");

            enrollment.Status = EnrollmentStatus.Cancelled;
            enrollment.CompletedAt = null;

            await context.SaveChangesAsync();

            return Ok("Enrollment cancelled successfully");
        }

        [HttpGet("latest")]
        [Authorize(Roles = "Instructor")]
        public async Task<ActionResult<List<CourseDto>>> GetLatestEnrollment()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var enrollments = await context.Enrollments
                .Where(e => e.Course.InstructorId == userId)
                .Include(e => e.User)
                .Include(e => e.Course)
                .Take(10)
                .Select(e => new
                {
                    studentName = e.User.FirstName + " " + e.User.LastName,
                    courseTitle = e.Course.Title,
                    createdAt = e.EnrolledAt
                })
                .ToListAsync();

            return Ok(enrollments);
        }

        [HttpGet("certificate/{courseId}")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetCertificate(int courseId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var enrollment = await context.Enrollments
                .Include(e => e.Course)
                    .ThenInclude(c => c.Instructor)
                .Include(e => e.User)
                .FirstOrDefaultAsync(e =>
                    e.UserId == userId &&
                    e.CourseId == courseId &&
                    e.Status != EnrollmentStatus.Cancelled);

            if (enrollment == null)
                return NotFound("Enrollment not found");

            if (enrollment.Progress < 100)
                return BadRequest("Course not completed yet");

            return Ok(new
            {
                studentName = enrollment.User.FirstName + " " + enrollment.User.LastName,
                courseTitle = enrollment.Course.Title,
                instructorName = enrollment.Course.Instructor.FirstName + " " + enrollment.Course.Instructor.LastName,
                completedAt = enrollment.CompletedAt ?? DateTime.UtcNow
            });
        }

        [HttpGet("streak")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetLearningStreak()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var dates = await context.LearningActivities
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.Date)
                .Select(x => x.Date)
                .ToListAsync();

            if (!dates.Any())
                return Ok(0);

            int streak = 1;

            for (int i = 1; i < dates.Count; i++)
            {
                var diff = (dates[i - 1] - dates[i]).Days;

                if (diff == 1)
                    streak++;

                else if (diff > 1)
                    break;
            }

            return Ok(streak);
        }
    }
}