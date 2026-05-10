using System;
using API.Entities;

namespace API.Models;

public class ReviewDto
{
    public int Id { get; set; }
    public int CourseId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string? InstructorReply { get; set; }

    public string CourseTitle { get; set; } = string.Empty;
    public string? CourseThumbnail { get; set; }

    public string? LessonTitle { get; set; }
    public string? SectionTitle { get; set; }
    public UserDto? User { get; set; }
}
