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
    public class SectionsController(WebContext context) : ControllerBase
    {
        [HttpGet("{id}")]
        public async Task<ActionResult<Section>> GetSection(int id)
        {
            var section = await context.Sections.FindAsync(id);
            if (section == null)
                return NotFound();

            return Ok(section);
        }

        [HttpGet("course/{courseId}")]
        public async Task<ActionResult<List<Section>>> GetSectionsByCourse(int courseId)
        {
            var sections = await context.Sections
                .Where(s => s.CourseId == courseId)
                .OrderBy(s => s.Order)
                .Select(s => new SectionDto
                {
                    Id = s.Id,
                    Order = s.Order,
                    Title = s.Title,
                    Lessons = s.Lessons
                        .OrderBy(l => l.Order)
                        .Select(l => new LessonDto
                        {
                            Id = l.Id,
                            Title = l.Title,
                            Content = l.Content,
                            VideoUrl = l.VideoUrl,
                            FileUrl = l.FileUrl,
                            DurationInMinutes = l.DurationInMinutes,
                            IsPreview = l.IsPreview,
                            Order = l.Order
                        })
                        .ToList()
                })
                .ToListAsync();
                
            return Ok(sections);
        }

        [HttpPost]
        [Authorize(Roles = "Admin, Instructor")]
        public async Task<ActionResult<Section>> CreateSection(SectionDto sectionDto)
        {
            var course = await context.Courses.FindAsync(sectionDto.CourseId);
            if (course == null)
                return NotFound("Course not found");

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var role = User.FindFirst(ClaimTypes.Role)!.Value;

            if (course.InstructorId != userId && role != "Admin")
                return StatusCode(403, "Only the course instructor or admin can create sections");

            var section = new Section
            {
                Title = sectionDto.Title,
                Order = sectionDto.Order,
                CourseId = sectionDto.CourseId
            };

            context.Sections.Add(section);
            await context.SaveChangesAsync();

            return Ok(new SectionDto
            {
                Title = section.Title,
                Order = section.Order
            });
        }


        [HttpPut("{id}")]
        [Authorize(Roles = "Admin, Instructor")]
        public async Task<ActionResult<Section>> UpdateSection(int id, SectionDto sectionDto)
        {
            var section = await context.Sections
                .Include(s => s.Course)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (section == null)
                return NotFound("Section not found");

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var role = User.FindFirst(ClaimTypes.Role)!.Value;

            if (section.Course.InstructorId != userId && role != "Admin")
                return StatusCode(403, "Only the course instructor or admin can update sections");

            section.Title = sectionDto.Title;
            section.Order = sectionDto.Order;

            await context.SaveChangesAsync();

            return Ok(new SectionDto
            {
                Title = section.Title,
                Order = section.Order
            });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin, Instructor")]
        public async Task<ActionResult> DeleteSection(int id)
        {
            var section = await context.Sections
                .Include(s => s.Course)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (section == null)
                return NotFound("Section not found");

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var role = User.FindFirst(ClaimTypes.Role)!.Value;

            if (section.Course.InstructorId != userId && role != "Admin")
                return StatusCode(403, "Only the course instructor or admin can delete sections");

            context.Sections.Remove(section);
            await context.SaveChangesAsync();

            return Ok("Section deleted successfully");
        }
        
        [HttpPut("reorder")]
        public async Task<IActionResult> ReorderSections(List<ReorderDto> items)
        {
            foreach (var item in items)
            {
                var section = await context.Sections.FindAsync(item.Id);
                if (section != null)
                {
                    section.Order = item.Order;
                }
            }

            await context.SaveChangesAsync();
            return Ok();
        }
    }
}
