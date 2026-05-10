using System;

namespace API.Entities;

public class Review
{
        public int Id { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public string? InstructorReply { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        public int CourseId { get; set; }
        public Course Course { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int? LessonId { get; set; }
        public Lesson Lesson { get; set; } = null!;

        public int? SectionId{ get; set; }
        public Section Section { get; set; } = null!;
}
    