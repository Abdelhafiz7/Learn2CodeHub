using System;

namespace API.Models;

public class SectionDto
{
    public string Title { get; set; } = string.Empty;
    public int Order { get; set; }
    public int CourseId { get; set; }
    public int Id { get; set; }
    public List<LessonDto> Lessons { get; set; } = new ();
}
