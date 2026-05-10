using System;

namespace API.Models;

public class InstructorDto
{
    public int Id { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? ProfileImageUrl { get; set; }
    public string? Bio { get; set; }
    public double? Rating { get; set; }
    public int TotalStudents { get; set; }
    public int TotalCourses { get; set; }
    public int TotalReviewers{ get; set; }
}
