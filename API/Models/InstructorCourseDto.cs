using System;
using API.Enums;

namespace API.Models;

public class InstructorCourseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool IsPublished { get; set; }
    public string? Status { get; set; }
    public string? RejectionReason { get; set; }
    public int EnrollmentCount { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }


    public CourseLevel Level { get; set; }
    public DateTime CreatedAt { get; set; }
}
