using System;

namespace API.Models;

public class LessonDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Content { get; set; }
    public string? VideoUrl { get; set; }
    public string? FileUrl { get; set; }
    public int DurationInMinutes { get; set; }
    public bool IsPreview { get; set; } = false;
    public int Order { get; set; }
    public int SectionId { get; set; }

}