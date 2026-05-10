using System;

namespace API.Models;

public class NotesDto
{
    public int UserId { get; set; }
    public int LessonId { get; set; }
    public string? Content { get; set; }
    public DateTime UpdatedAt { get; set; }
}
