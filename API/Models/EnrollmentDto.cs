using System;

namespace API.Models;

public class EnrollmentDto
{
    public int CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime EnrolledAt { get; set; }
    public DateTime CompletedAt { get; set; }
     
}
