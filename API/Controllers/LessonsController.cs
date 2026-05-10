using System.Security.Claims;
using System.Security.Cryptography.X509Certificates;
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
    public class LessonsController(WebContext context) : ControllerBase
    {
        [HttpGet("{id}")]
        public async Task<ActionResult<Lesson>> GetLesson(int id)
        {
            var lessons = await context.Lessons
                .Where(l => l.Id == id)
                .Select(l => new
                {
                    id = l.Id,
                    title = l.Title,
                    videoUrl = l.VideoUrl,
                    duration = l.DurationInMinutes,
                    sectionId = l.SectionId,
                    content = l.Content

                })
                .ToListAsync();

            return Ok(lessons);
        }

        [HttpGet("section/{sectionId}")]
        public async Task<ActionResult<List<Lesson>>> GetLessonsBySection(int sectionId)
        {
            var lessons = await context.Lessons
                .Where(l => l.SectionId == sectionId)
                .OrderBy(l => l.Order)
                .ToListAsync();

            return Ok(lessons);
        }

        [HttpPost]
        [Authorize(Roles = "Admin, Instructor")]
        public async Task<ActionResult<Lesson>> CreateLesson(LessonDto lessonDto)
        {
            var section = await context.Sections
                .Include(s => s.Course)
                .FirstOrDefaultAsync(s => s.Id == lessonDto.SectionId);

            if (section == null)
                return NotFound("Section not found");


            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var role = User.FindFirst(ClaimTypes.Role)!.Value;

            if (section.Course.InstructorId != userId && role != "Admin")
                return StatusCode(403, "Only the course instructor or admin can create lessons");

            var lesson = new Lesson
            {
                Title = lessonDto.Title,
                Content = lessonDto.Content,
                VideoUrl = lessonDto.VideoUrl,
                FileUrl = lessonDto.FileUrl,
                DurationInMinutes = lessonDto.DurationInMinutes,
                IsPreview = lessonDto.IsPreview,
                Order = lessonDto.Order,
                SectionId = lessonDto.SectionId,
            };

            context.Lessons.Add(lesson);
            await context.SaveChangesAsync();

            return Ok(new LessonDto
            {
                Title = lesson.Title,
                Content = lesson.Content,
                VideoUrl = lesson.VideoUrl,
                FileUrl = lesson.FileUrl,
                DurationInMinutes = lesson.DurationInMinutes,
                IsPreview = lesson.IsPreview,
                Order = lesson.Order,
                SectionId = lesson.SectionId
            });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin, Instructor")]
        public async Task<ActionResult<Lesson>> UpdateLesson(int id, LessonDto lessonDto)
        {
            var lesson = await context.Lessons
                .Include(l => l.Section)
                .ThenInclude(s => s.Course)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (lesson == null)
                return NotFound("Lesson not found");

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var role = User.FindFirst(ClaimTypes.Role)!.Value;

            if (lesson.Section.Course.InstructorId != userId && role != "Admin")
                return StatusCode(403, "Only the course instructor or admin can update lessons");

            lesson.Title = lessonDto.Title;
            lesson.Content = lessonDto.Content;
            lesson.VideoUrl = lessonDto.VideoUrl;
            lesson.FileUrl = lessonDto.FileUrl;
            lesson.DurationInMinutes = lessonDto.DurationInMinutes;
            lesson.IsPreview = lessonDto.IsPreview;
            lesson.Order = lessonDto.Order;

            await context.SaveChangesAsync();

            return Ok(new LessonDto
            {
                Title = lesson.Title,
                Content = lesson.Content,
                VideoUrl = lesson.VideoUrl,
                FileUrl = lesson.FileUrl,
                DurationInMinutes = lesson.DurationInMinutes,
                IsPreview = lesson.IsPreview,
                Order = lesson.Order,
                SectionId = lesson.SectionId
            });

        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin, Instructor")]
        public async Task<ActionResult> DeleteLesson(int id)
        {
            var lesson = await context.Lessons
                .Include(l => l.Section)
                .ThenInclude(s => s.Course)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (lesson == null)
                return NotFound("Lesson not found");

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var role = User.FindFirst(ClaimTypes.Role)!.Value;

            if (lesson.Section.Course.InstructorId != userId && role != "Admin")
                return StatusCode(403, "Only the course instructor or admin can delete lessons");

            context.Lessons.Remove(lesson);
            await context.SaveChangesAsync();

            return Ok("Lesson deleted successfully");

        }

        [HttpPost("complete/{lessonId}")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> CompleteLesson(int lessonId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var progress = await context.LessonProgresses
                .FirstOrDefaultAsync(p => p.UserId == userId && p.LessonId == lessonId);

            if (progress == null)
            {
                progress = new LessonProgress
                {
                    UserId = userId,
                    LessonId = lessonId,
                    IsCompleted = true,
                    LastViewedAt = DateTime.UtcNow
                };

                context.LessonProgresses.Add(progress);
            }
            else
            {
                progress.IsCompleted = true;
                progress.LastViewedAt = DateTime.UtcNow;
            }

            await context.SaveChangesAsync();

            return Ok();
        }
        [HttpGet("progress")]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult<LessonProgressDto>> GetProgress()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var completedLessons = await context.LessonProgresses
                .Where(p => p.UserId == userId && p.IsCompleted)
                .Select(p => p.LessonId)
                .ToListAsync();

            return Ok(completedLessons);
        }
    }
}

