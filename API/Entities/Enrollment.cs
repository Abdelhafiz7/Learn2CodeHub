using System;
using API.Enums;

namespace API.Entities;

public class Enrollment
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int CourseId { get; set; }
    public double Progress { get; set; } = 0;
    public DateTime? LastAccessedAt { get; set; }
    public int? LastLessonId { get; set; }
    public Lesson? LastLesson { get; set; } = null!;
    public Course Course { get; set; } = null!;
    public EnrollmentStatus Status { get; set; } = EnrollmentStatus.Active;
    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
}
