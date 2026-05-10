using System;
using API.Enums;

namespace API.Entities;

public class Course
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string ShortDescription { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; } 
    public string Language { get; set; } = "English";
    public CourseLevel Level { get; set; } = CourseLevel.Beginner;
    public bool IsPublished { get; set; } = false;
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public int InstructorId { get; set; }
    public User Instructor { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt{ get; set; }
    
    public CourseStatus Status { get; set; } = CourseStatus.Draft;
    public string? RejectionReason { get; set; }


    //Navigation properties
    public ICollection<Section> Sections { get; set; } = new List<Section>();
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();


}
