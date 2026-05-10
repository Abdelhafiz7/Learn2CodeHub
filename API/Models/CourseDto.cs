using System;
using System.Runtime;
using API.Enums;

namespace API.Models;

public class CourseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public CourseLevel Level { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string Language { get; set; } = "English";
    public bool IsPublished { get; set; }
    public int CourseId { get; set; }
    public int TotalLessons { get; set; }
    public int CompletedLessons { get; set; }
    public double Percentage { get; set; }
    public string Status { get; set; } = "Drafts";
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int TotalDuration { get; set; }
    public double Rating { get; set; }
    public int ReviewCount { get; set; }
    public int EnrollmentCount { get; set; }
    public DateTime? updatedAt { get; set; }
    public int InstructorId { get; set; }


    public CategoryDto Category { get; set; } = new();
    public InstructorDto Instructor { get; set; } = new();
    public List<SectionDto>? Sections { get; set; }

}
