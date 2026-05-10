using System;

namespace API.Entities;

public class Section
{
    public int Id { get; set; }
    
    public string Title { get; set; } = string.Empty;

    public int Order { get; set; }
    
    public int CourseId { get; set; }
    public Course Course { get; set; } = null!;

    public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
}
