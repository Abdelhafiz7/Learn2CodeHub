using System.Security.Claims;
using API.Data;
using API.Entities;
using API.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NoteController(WebContext context) : ControllerBase
    {
        [HttpGet("{lessonId}")]
        public async Task<IActionResult> GetNote(int lessonId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var note = await context.LessonNotes
                .FirstOrDefaultAsync(n => n.LessonId == lessonId && n.UserId == userId);

            if (note == null)
                return Ok(new { content = "" });

            return Ok(note);
        }

        [HttpPost]
        public async Task<IActionResult> SaveNote(NotesDto notesDtodto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var note = await context.LessonNotes
                .FirstOrDefaultAsync(n => n.LessonId == notesDtodto.LessonId && n.UserId == userId);

            if (note == null)
            {
                note = new Notes
                {
                    LessonId = notesDtodto.LessonId,
                    UserId = userId,
                    Content = notesDtodto.Content,
                    CreatedAt = DateTime.UtcNow
                };

                context.LessonNotes.Add(note);
            }
            else
            {
                note.Content = notesDtodto.Content;
                note.CreatedAt = DateTime.UtcNow;
            }

            await context.SaveChangesAsync();

            return Ok(note);
        }
    }
}
