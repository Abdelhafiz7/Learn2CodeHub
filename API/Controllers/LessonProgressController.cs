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
    public class LessonProgressController(WebContext context) : ControllerBase
    {
        [HttpPost("update")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> UpdateLessonProgress(LessonProgressDto lessonProgressDto)
        {
            if (lessonProgressDto.WatchedPercentage < 0 || lessonProgressDto.WatchedPercentage > 100)
                return BadRequest("Percentage must be between 0 and 100.");

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await TrackLearningActivity(userId);

            var progress = await context.LessonProgresses
                .FirstOrDefaultAsync(p => p.UserId == userId && p.LessonId == lessonProgressDto.LessonId);

            if (progress == null)
            {
                progress = new LessonProgress
                {
                    UserId = userId,
                    LessonId = lessonProgressDto.LessonId,
                    WatchedPercentage = lessonProgressDto.WatchedPercentage,
                    LastViewedAt = DateTime.UtcNow,
                    IsCompleted = lessonProgressDto.WatchedPercentage >= 100
                };

                context.LessonProgresses.Add(progress);
            }
            else
            {
                progress.WatchedPercentage = lessonProgressDto.WatchedPercentage;
                progress.LastViewedAt = DateTime.UtcNow;


                if (lessonProgressDto.WatchedPercentage >= 100)
                    progress.IsCompleted = true;
            }

            await context.SaveChangesAsync();

            var lesson = await context.Lessons
                .Include(l => l.Section)
                .FirstOrDefaultAsync(l => l.Id == lessonProgressDto.LessonId);

            if (lesson == null)
                return NotFound("Lesson not found");

            var courseId = lesson.Section.CourseId;

            var enrollment = await context.Enrollments
                .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == courseId);

            if (enrollment != null)
            {
                var lessonIds = await context.Lessons
                    .Where(l => l.Section.CourseId == courseId)
                    .Select(l => l.Id)
                    .ToListAsync();

                var progresses = await context.LessonProgresses
                    .Where(lp => lp.UserId == userId && lessonIds.Contains(lp.LessonId))
                    .ToListAsync();

                double avgProgress = 0;

                if (lessonIds.Count > 0)
                {
                    avgProgress = lessonIds
                        .Select(id => progresses.FirstOrDefault(p => p.LessonId == id)?.WatchedPercentage ?? 0)
                        .Average();
                }

                enrollment.Progress = (int)avgProgress;
                enrollment.LastLessonId = lessonProgressDto.LessonId;
                enrollment.LastAccessedAt = DateTime.UtcNow;

                if (enrollment.Progress == 100)
                {
                    enrollment.Status = EnrollmentStatus.Completed;
                    enrollment.CompletedAt = DateTime.UtcNow;
                }

                await context.SaveChangesAsync();
            }
            return Ok("Progress updated successfully.");
        }

        [HttpPut("{lessonId}/complete")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> CompleteLesson(int lessonId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            await TrackLearningActivity(userId);

            var progress = await context.LessonProgresses
                .FirstOrDefaultAsync(p => p.UserId == userId && p.LessonId == lessonId);

            if (progress == null)
            {
                progress = new LessonProgress
                {
                    UserId = userId,
                    LessonId = lessonId,
                    IsCompleted = true,
                    WatchedPercentage = 100,
                    LastViewedAt = DateTime.UtcNow,
                };

                context.LessonProgresses.Add(progress);
            }
            else
            {
                progress.IsCompleted = true;
                progress.WatchedPercentage = 100;
                progress.LastViewedAt = DateTime.UtcNow;
            }

            await context.SaveChangesAsync();

            var lesson = await context.Lessons
                .Include(l => l.Section)
                .FirstOrDefaultAsync(l => l.Id == lessonId);

            if (lesson != null)
            {
                var courseId = lesson.Section.CourseId;

                var enrollment = await context.Enrollments
                    .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == courseId);

                if (enrollment != null)
                {
                    var lessonIds = await context.Lessons
                        .Where(l => l.Section.CourseId == courseId)
                        .Select(l => l.Id)
                        .ToListAsync();

                    var progresses = await context.LessonProgresses
                        .Where(lp => lp.UserId == userId && lessonIds.Contains(lp.LessonId))
                        .ToListAsync();

                    double avgProgress = lessonIds
                        .Select(id => progresses.FirstOrDefault(p => p.LessonId == id)?.WatchedPercentage ?? 0)
                        .Average();

                    enrollment.Progress = (int)avgProgress;
                    enrollment.LastLessonId = lessonId;
                    enrollment.LastAccessedAt = DateTime.UtcNow;

                    if (enrollment.Progress == 100)
                    {
                        enrollment.Status = EnrollmentStatus.Completed;
                        enrollment.CompletedAt = DateTime.UtcNow;
                    }

                    await context.SaveChangesAsync();
                }
            }

            return Ok(new { lessonId, isCompleted = true });
        }


        [HttpGet("{lessonId}")]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult<LessonProgressDto>> GetProgress(int lessonId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var progress = await context.LessonProgresses
                .Where(p => p.UserId == userId && p.LessonId == lessonId)
                .Select(p => new LessonProgressDto
                {
                    LessonId = p.LessonId,
                    IsCompleted = p.IsCompleted,
                    WatchedPercentage = p.WatchedPercentage,
                    LastViewedAt = p.LastViewedAt
                })
                .FirstOrDefaultAsync();

            if (progress == null)
                return Ok(new { watchedPercentage = 0 });

            return Ok(progress);
        }

        private async Task TrackLearningActivity(int userId)
        {
            var today = DateTime.UtcNow.Date;

            var exists = await context.LearningActivities
                .AnyAsync(x => x.UserId == userId && x.Date == today);

            if (!exists)
            {
                context.LearningActivities.Add(new LearningActivity
                {
                    UserId = userId,
                    Date = today
                });
            }
        }

        [HttpGet("course/{courseId}/completed")]
        [Authorize]
        public async Task<ActionResult<List<int>>> GetCompletedLessons(int courseId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var completedLessons = await context.LessonProgresses
                .Where(p => p.UserId == userId &&
                            p.IsCompleted &&
                            p.Lesson.Section.CourseId == courseId)
                .Select(p => p.LessonId)
                .ToListAsync();

            return Ok(completedLessons);
        }

        [HttpGet("course/{courseId}/progress")]
        [Authorize]
        public async Task<ActionResult<int?>> GetLastLessons(int courseId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var enrollment = await context.Enrollments
                .FirstOrDefaultAsync(e => e.UserId == userId && e.CourseId == courseId);

            if (enrollment == null)
                return Ok(null);

            return Ok(enrollment.LastLessonId);
        }
    }
}


